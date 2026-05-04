import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogService } from '../log/log.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ListReportsQueryDto } from './dto/list-reports-query.dto';
import { buildPaginatedResponse } from '../common/dto/paginated-response.dto';

const VALID_SORT_FIELDS = ['id', 'titulo', 'fechaRegistro', 'orderIndex'] as const;
type ValidSortField = (typeof VALID_SORT_FIELDS)[number];

function toValidSortField(field?: string): ValidSortField {
  if (field && VALID_SORT_FIELDS.includes(field as ValidSortField)) {
    return field as ValidSortField;
  }
  return 'orderIndex';
}

// Include para tabla admin — trae referencia al padre, conteo de hijos y usuarios con acceso
const REPORT_INCLUDE_ADMIN = {
  reportesRoles: { include: { rol: true } },
  reportesUsuarios: { include: { usuario: { select: { id: true, email: true, nombreCompleto: true } } } },
  padre: { select: { id: true, titulo: true } },
  _count: { select: { children: true } },
} as const;

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logService: LogService,
  ) {}

  // ── Endpoint público (Sidebar) — query plana + árbol en memoria (N niveles) ──
  async findByRole(rolId: number, userId: number) {
    const where: Record<string, unknown> = { activo: true };

    // Admin ve todo; otros filtran por rol O acceso individual
    if (rolId !== 1) {
      where.OR = [
        { reportesRoles: { some: { rolId } } },
        { reportesUsuarios: { some: { usuarioId: userId } } },
      ];
    }

    const allReports = await this.prisma.report.findMany({
      where,
      include: {
        reportesRoles: { include: { rol: true } },
        reportesUsuarios: { select: { usuarioId: true } },
      },
      orderBy: { orderIndex: 'asc' },
    });

    return this.buildTree(allReports);
  }

  // ── Construir árbol jerárquico en memoria a partir de lista plana ──
  private buildTree<T extends { id: number; padreId: number | null }>(
    reports: T[],
  ): (T & { children: T[] })[] {
    const map = new Map<number, T & { children: T[] }>();
    const roots: (T & { children: T[] })[] = [];

    for (const r of reports) {
      map.set(r.id, { ...r, children: [] });
    }

    for (const r of reports) {
      const node = map.get(r.id)!;
      if (r.padreId && map.has(r.padreId)) {
        map.get(r.padreId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  // ── Hijos directos de un reporte (modal de edición) ───────────────────
  async findChildren(parentId: number) {
    return this.prisma.report.findMany({
      where: { padreId: parentId },
      include: {
        reportesRoles: { include: { rol: true } },
        reportesUsuarios: { include: { usuario: { select: { id: true, email: true, nombreCompleto: true } } } },
        _count: { select: { children: true } },
      },
      orderBy: { orderIndex: 'asc' },
    });
  }

  // ── Tabla admin paginada ──────────────────────────────────────────────
  async findAllAdmin(query: ListReportsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 5;
    const skip = (page - 1) * limit;
    const sortBy = toValidSortField(query.sortBy);
    const order = query.order ?? 'asc';

    const where: Record<string, unknown> = {};

    if (query.search) {
      where.OR = [
        { titulo: { contains: query.search, mode: 'insensitive' } },
        { descripcion: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.activo !== undefined) where.activo = query.activo;

    const [data, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
        include: REPORT_INCLUDE_ADMIN,
      }),
      this.prisma.report.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, page, limit);
  }

  // ── Crear reporte (con padreId opcional) ──────────────────────────────
  async create(dto: CreateReportDto, executorId: number) {
    if (dto.padreId != null) {
      await this.prisma.report.findUniqueOrThrow({
        where: { id: dto.padreId },
      });
    }

    // Invariante: un sub-reporte siempre debe tener URL.
    if (dto.padreId != null && (dto.urlIframe == null || dto.urlIframe === '')) {
      throw new BadRequestException(
        'Un sub-reporte debe tener URL de Looker Studio',
      );
    }

    // Calcular orderIndex: el nuevo reporte va al final de su nivel (entre hermanos del mismo padreId).
    const maxOrder = await this.prisma.report.aggregate({
      where: { padreId: dto.padreId ?? null },
      _max: { orderIndex: true },
    });
    const nextOrderIndex = (maxOrder._max.orderIndex ?? 0) + 1;

    await this.prisma.report.create({
      data: {
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        urlIframe: dto.urlIframe ?? null,
        activo: dto.activo ?? true,
        padreId: dto.padreId ?? null,
        orderIndex: nextOrderIndex,
        reportesRoles: {
          create: dto.rolesIds.map((rolId) => ({ rolId })),
        },
        ...(dto.usuariosIds?.length && {
          reportesUsuarios: {
            create: dto.usuariosIds.map((usuarioId) => ({ usuarioId })),
          },
        }),
      },
    });
    await this.logService.register({
      usuarioId: executorId,
      accion: 'CREAR_REPORTE',
      detalle: `Reporte creado: ${dto.titulo}`,
    });
    return { message: 'Reporte creado exitosamente' };
  }

  // ── Actualizar reporte (con validación anti-circular) ─────────────────
  async update(id: number, dto: UpdateReportDto, executorId: number) {
    if (dto.padreId !== undefined) {
      if (dto.padreId === id) {
        throw new BadRequestException(
          'Un reporte no puede ser padre de sí mismo',
        );
      }
      if (dto.padreId !== null) {
        // Recorrer cadena de ancestros para detectar ciclos
        let ancestorId: number | null = dto.padreId;
        while (ancestorId !== null) {
          if (ancestorId === id) {
            throw new BadRequestException('Dependencia circular detectada');
          }
          const ancestor: { padreId: number | null } | null =
            await this.prisma.report.findUnique({
              where: { id: ancestorId },
              select: { padreId: true },
            });
          ancestorId = ancestor?.padreId ?? null;
        }
      }
    }

    // Invariante post-update: si el reporte queda como sub-reporte, debe tener URL.
    // El estado resultante combina los campos del DTO (si vienen) con los actuales en BD.
    const current = await this.prisma.report.findUniqueOrThrow({
      where: { id },
      select: { padreId: true, urlIframe: true },
    });
    const resultingPadreId =
      dto.padreId !== undefined ? dto.padreId : current.padreId;
    const resultingUrlIframe =
      dto.urlIframe !== undefined ? dto.urlIframe : current.urlIframe;
    if (
      resultingPadreId != null &&
      (resultingUrlIframe == null || resultingUrlIframe === '')
    ) {
      throw new BadRequestException(
        'Un sub-reporte debe tener URL de Looker Studio',
      );
    }

    await this.prisma.report.update({
      where: { id },
      data: {
        ...(dto.titulo !== undefined && { titulo: dto.titulo }),
        ...(dto.urlIframe !== undefined && {
          urlIframe: dto.urlIframe === '' ? null : dto.urlIframe,
        }),
        ...(dto.descripcion !== undefined && { descripcion: dto.descripcion }),
        ...(dto.activo !== undefined && { activo: dto.activo }),
        ...(dto.padreId !== undefined && { padreId: dto.padreId }),
        ...(dto.rolesIds !== undefined && {
          reportesRoles: {
            deleteMany: {},
            create: dto.rolesIds.map((rolId) => ({ rolId })),
          },
        }),
        ...(dto.usuariosIds !== undefined && {
          reportesUsuarios: {
            deleteMany: {},
            create: dto.usuariosIds.map((usuarioId) => ({ usuarioId })),
          },
        }),
      },
    });
    await this.logService.register({
      usuarioId: executorId,
      accion: 'ACTUALIZAR_REPORTE',
      detalle: `Reporte actualizado: id=${id}`,
    });
    return { message: 'Reporte actualizado exitosamente' };
  }

  async toggleActivo(id: number, executorId: number) {
    const report = await this.prisma.report.findUniqueOrThrow({
      where: { id },
    });
    const updated = await this.prisma.report.update({
      where: { id },
      data: { activo: !report.activo },
      include: REPORT_INCLUDE_ADMIN,
    });
    await this.logService.register({
      usuarioId: executorId,
      accion: 'TOGGLE_REPORTE',
      detalle: `Reporte id=${id}: ${updated.activo ? 'activado' : 'desactivado'}`,
    });
    return updated;
  }

  async remove(id: number, executorId: number) {
    await this.prisma.report.update({
      where: { id },
      data: { activo: false },
    });
    await this.logService.register({
      usuarioId: executorId,
      accion: 'DESACTIVAR_REPORTE',
      detalle: `Desactivado: id=${id}`,
    });
    return { message: 'Reporte desactivado exitosamente' };
  }

  // ── Listado admin sin paginar (para modo "Reordenar") ────────────────
  async findAllAdminFlat() {
    return this.prisma.report.findMany({
      include: REPORT_INCLUDE_ADMIN,
      orderBy: { orderIndex: 'asc' },
    });
  }

  // ── Reordenar hermanos en transacción ─────────────────────────────────
  async reorder(
    padreId: number | null,
    orderedIds: number[],
    executorId: number,
  ) {
    // Validación: no duplicados
    const uniqueIds = new Set(orderedIds);
    if (uniqueIds.size !== orderedIds.length) {
      throw new BadRequestException('La lista contiene IDs duplicados');
    }

    // Validación: todos los IDs existen y son hermanos del mismo padreId
    const found = await this.prisma.report.findMany({
      where: { id: { in: orderedIds } },
      select: { id: true, padreId: true },
    });
    if (found.length !== orderedIds.length) {
      throw new BadRequestException('Algún reporte no existe');
    }
    const expected = padreId ?? null;
    const allSiblings = found.every((r) => (r.padreId ?? null) === expected);
    if (!allSiblings) {
      throw new BadRequestException(
        'Todos los reportes deben compartir el mismo padre',
      );
    }

    // Reasignación atómica: orderIndex 1..N en transacción
    await this.prisma.$transaction(
      orderedIds.map((id, idx) =>
        this.prisma.report.update({
          where: { id },
          data: { orderIndex: idx + 1 },
        }),
      ),
    );

    await this.logService.register({
      usuarioId: executorId,
      accion: 'REORDENAR_REPORTES',
      detalle: `Reordenados ${orderedIds.length} reportes (padre=${padreId ?? 'raíz'})`,
    });

    return { message: 'Orden actualizado' };
  }
}
