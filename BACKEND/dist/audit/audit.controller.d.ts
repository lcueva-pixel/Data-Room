import { AuditService } from './audit.service';
import { CreateReportViewDto } from './dto/create-report-view.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
export declare class AuditController {
    private readonly auditService;
    constructor(auditService: AuditService);
    findAll(query: PaginationQueryDto): Promise<import("../common/dto/paginated-response.dto").PaginatedResponse<import("./types/audit.types").UnifiedAuditEntry>>;
    registerReportTime(req: any, dto: CreateReportViewDto): Promise<{
        ok: boolean;
    }>;
}
