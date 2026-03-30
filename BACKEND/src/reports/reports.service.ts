import { Injectable } from '@nestjs/common';
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

const REPORT_INCLUDE = {
  reportesRoles: { include: { rol: true } },
} as const;

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async findByRole(rolId: number) {
    if (rolId === 1) {
      return this.prisma.report.findMany({
        where: { activo: true },
        include: REPORT_INCLUDE,
        orderBy: { id: 'asc' },
      });
    }
    return this.prisma.report.findMany({
      where: {
        activo: true,
        reportesRoles: { some: { rolId } },
      },
      include: REPORT_INCLUDE,
      orderBy: { id: 'asc' },
    });
  }

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
        include: REPORT_INCLUDE,
      }),
      this.prisma.report.count({ where }),
    ]);

    return buildPaginatedResponse(data, total, page, limit);
  }

  async create(dto: CreateReportDto) {
    await this.prisma.report.create({
      data: {
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        urlIframe: dto.urlIframe,
        activo: dto.activo ?? true,
        reportesRoles: {
          create: dto.rolesIds.map((rolId) => ({ rolId })),
        },
      },
    });
    return { message: 'Reporte creado exitosamente' };
  }

  async update(id: number, dto: UpdateReportDto) {
    await this.prisma.report.update({
      where: { id },
      data: {
        ...(dto.titulo !== undefined && { titulo: dto.titulo }),
        ...(dto.urlIframe !== undefined && { urlIframe: dto.urlIframe }),
        ...(dto.descripcion !== undefined && { descripcion: dto.descripcion }),
        ...(dto.activo !== undefined && { activo: dto.activo }),
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
    const report = await this.prisma.report.findUniqueOrThrow({ where: { id } });
    const updated = await this.prisma.report.update({
      where: { id },
      data: { activo: !report.activo },
      include: REPORT_INCLUDE,
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
