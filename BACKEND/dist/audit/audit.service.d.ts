import { PrismaService } from '../prisma/prisma.service';
import { AuditAccessRecord, UnifiedAuditEntry } from './types/audit.types';
import { CreateReportViewDto } from './dto/create-report-view.dto';
export declare class AuditService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    registerAccess(record: AuditAccessRecord): Promise<{
        id: number;
        usuarioId: number;
        fechaHora: Date;
        ipAddress: string | null;
        userAgent: string | null;
    }>;
    findAll(): Promise<UnifiedAuditEntry[]>;
    registerReportView(usuarioId: number, dto: CreateReportViewDto): Promise<{
        id: number;
        reporteId: number;
        usuarioId: number;
        fechaHora: Date;
        duracion: number;
    }>;
}
