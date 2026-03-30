import { AuditService } from './audit.service';
import { CreateReportViewDto } from './dto/create-report-view.dto';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    findAll(): Promise<import("./types/audit.types").UnifiedAuditEntry[]>;
    registerReportTime(req: any, dto: CreateReportViewDto): Promise<{
        ok: boolean;
    }>;
}
