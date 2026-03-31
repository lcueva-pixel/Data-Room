import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ListReportsQueryDto } from './dto/list-reports-query.dto';
import { buildPaginatedResponse } from '../common/dto/paginated-response.dto';

const VALID_SORT_FIELDS = ['id', 'titulo', 'fechaRegistro'] as const;
type ValidSortField = (typeof VALID_SORT_FIELDS)[number];

function toValidSortField(field?: string): ValidSortField {
  if (field && VALID_SORT_FIELDS.includes(field as ValidSortField)) {
    return field as ValidSortField;
  }
  return 'id';
}

// Include para tabla admin — trae referencia al padre y conteo de hijos
const REPORT_INCLUDE_ADMIN = {
  reportesRoles: { include: { rol: true } },
  padre: { select: { id: true, titulo: true } },
  _count: { select: { children: true } },
} as const;

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Endpoint público (Sidebar) — solo raíces con children recursivos ──
  async findByRole(rolId: number) {
    const childrenInclude = {
      reportesRoles: { include: { rol: true } },
      children: {
        where: { activo: true },
        include: {
          reportesRoles: { include: { rol: true } },
          children: {
            where: { activo: true },
            include: { reportesRoles: { include: { rol: true } } },
            orderBy: { id: 'asc' as const },
          },
        },
        orderBy: { id: 'asc' as const },
      },
    };

    if (rolId === 1) {
      return this.prisma.report.findMany({
        where: { activo: true, padreId: null },
        include: childrenInclude,
        orderBy: { id: 'asc' },
      });
    }

    return this.prisma.report.findMany({
      where: { activo: true, padreId: null, reportesRoles: { some: { rolId } } },
      include: {
        reportesRoles: { include: { rol: true } },
        children: {
          where: { activo: true, reportesRoles: { some: { rolId } } },
          include: {
            reportesRoles: { include: { rol: true } },
            children: {
              where: { activo: true, reportesRoles: { some: { rolId } } },
              include: { reportesRoles: { include: { rol: true } } },
              orderBy: { id: 'asc' as const },
            },
          },
          orderBy: { id: 'asc' as const },
        },
      },
      orderBy: { id: 'asc' },
    });
  }

  // ── Hijos directos de un reporte (modal de edición) ───────────────────
  async findChildren(parentId: number) {
    return this.prisma.report.findMany({
      where: { padreId: parentId },
      include: {
        reportesRoles: { include: { rol: true } },
        _count: { select: { children: true } },
      },
      orderBy: { id: 'asc' },
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
  async create(dto: CreateReportDto) {
    if (dto.padreId != null) {
      await this.prisma.report.findUniqueOrThrow({
        where: { id: dto.padreId },
      });
    }

    await this.prisma.report.create({
      data: {
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        urlIframe: dto.urlIframe,
        activo: dto.activo ?? true,
        padreId: dto.padreId ?? null,
        reportesRoles: {
          create: dto.rolesIds.map((rolId) => ({ rolId })),
        },
      },
    });
    return { message: 'Reporte creado exitosamente' };
  }

  // ── Actualizar reporte (con validación anti-circular) ─────────────────
  async update(id: number, dto: UpdateReportDto) {
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

    await this.prisma.report.update({
      where: { id },
      data: {
        ...(dto.titulo !== undefined && { titulo: dto.titulo }),
        ...(dto.urlIframe !== undefined && { urlIframe: dto.urlIframe }),
        ...(dto.descripcion !== undefined && { descripcion: dto.descripcion }),
        ...(dto.activo !== undefined && { activo: dto.activo }),
        ...(dto.padreId !== undefined && { padreId: dto.padreId }),
        ...(dto.rolesIds !== undefined && {
          reportesRoles: {
            deleteMany: {},
            create: dto.rolesIds.map((rolId) => ({ rolId })),
          },
        }),
      },
    });
    return { message: 'Reporte actualizado exitosamente' };
  }

  async toggleActivo(id: number) {
    const report = await this.prisma.report.findUniqueOrThrow({
      where: { id },
    });
    const updated = await this.prisma.report.update({
      where: { id },
      data: { activo: !report.activo },
      include: REPORT_INCLUDE_ADMIN,
    });
    return updated;
  }

  async remove(id: number) {
    await this.prisma.report.update({
      where: { id },
      data: { activo: false },
    });
    return { message: 'Reporte desactivado exitosamente' };
  }
}
