import { PrismaService } from '../prisma/prisma.service';
import { AuditAccessRecord, UnifiedAuditEntry } from './types/audit.types';
import { CreateReportViewDto } from './dto/create-report-view.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
export declare class AuditService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    registerAccess(record: AuditAccessRecord): Promise<{
        fechaHora: Date;
        userAgent: string | null;
        id: number;
        usuarioId: number;
    }>;
    findAll(query: PaginationQueryDto): Promise<import("../common/dto/paginated-response.dto").PaginatedResponse<UnifiedAuditEntry>>;
    registerReportView(usuarioId: number, dto: CreateReportViewDto): Promise<{
        fechaHora: Date;
        id: number;
        usuarioId: number;
        duracion: number;
        reporteId: number;
    }>;
}
