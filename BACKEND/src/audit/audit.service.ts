import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAccessRecord, UnifiedAuditEntry } from './types/audit.types';
import { CreateReportViewDto } from './dto/create-report-view.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { buildPaginatedResponse } from '../common/dto/paginated-response.dto';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async registerAccess(record: AuditAccessRecord) {
    return this.prisma.auditAccess.create({
      data: {
        usuarioId: record.usuarioId,
        userAgent: record.userAgent,
      },
    });
  }

  async findAll(query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const [accesos, visualizaciones] = await Promise.all([
      this.prisma.auditAccess.findMany({
        select: {
          id: true,
          fechaHora: true,
          usuario: { select: { nombreCompleto: true, email: true } },
        },
      }),
      this.prisma.reportViewLog.findMany({
        select: {
          id: true,
          fechaHora: true,
          duracion: true,
          reporte: { select: { titulo: true } },
          usuario: { select: { nombreCompleto: true, email: true } },
        },
      }),
    ]);

    const entriesAcceso: UnifiedAuditEntry[] = accesos.map((a) => ({
      id: `acceso-${a.id}`,
      tipo: 'ACCESO',
      fechaHora: a.fechaHora,
      usuario: a.usuario,
    }));

    const entriesVista: UnifiedAuditEntry[] = visualizaciones
      .filter((v) => v.reporte != null)
      .map((v) => ({
        id: `vista-${v.id}`,
        tipo: 'VISUALIZACION',
        fechaHora: v.fechaHora,
        usuario: v.usuario,
        reporte: { titulo: v.reporte.titulo },
        duracion: v.duracion,
      }));

    // Mezclar y filtrar
    let entries: UnifiedAuditEntry[] = [...entriesAcceso, ...entriesVista];

    if (query.search) {
      const s = query.search.toLowerCase();
      entries = entries.filter(
        (e) =>
          e.usuario.nombreCompleto.toLowerCase().includes(s) ||
          e.usuario.email.toLowerCase().includes(s),
      );
    }

    // Ordenar por fecha descendente
    entries.sort(
      (a, b) =>
        new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime(),
    );

    // Paginar
    const total = entries.length;
    const paginated = entries.slice((page - 1) * limit, page * limit);

    return buildPaginatedResponse(paginated, total, page, limit);
  }

  async registerReportView(usuarioId: number, dto: CreateReportViewDto) {
    await this.prisma.report.findUniqueOrThrow({
      where: { id: dto.reporteId },
    });

    return this.prisma.reportViewLog.create({
      data: {
        usuarioId,
        reporteId: dto.reporteId,
        duracion: dto.duracion,
      },
    });
  }
}
