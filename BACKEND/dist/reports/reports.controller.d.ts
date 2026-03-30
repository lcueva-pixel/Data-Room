import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ListReportsQueryDto } from './dto/list-reports-query.dto';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    findAll(req: any): Promise<({
        reportesRoles: ({
            rol: {
                id: number;
                rolDescripcion: string;
            };
        } & {
            rolId: number;
            reporteId: number;
        })[];
    } & {
        id: number;
        titulo: string;
        descripcion: string | null;
        urlIframe: string;
        activo: boolean;
        fechaRegistro: Date;
    })[]>;
    findAllAdmin(query: ListReportsQueryDto): Promise<import("../common/dto/paginated-response.dto").PaginatedResponse<{
        reportesRoles: ({
            rol: {
                id: number;
                rolDescripcion: string;
            };
        } & {
            rolId: number;
            reporteId: number;
        })[];
    } & {
        id: number;
        titulo: string;
        descripcion: string | null;
        urlIframe: string;
        activo: boolean;
        fechaRegistro: Date;
    }>>;
    create(createReportDto: CreateReportDto): Promise<{
        message: string;
    }>;
    update(id: number, updateReportDto: UpdateReportDto): Promise<{
        message: string;
    }>;
    toggleActivo(id: number): Promise<{
        reportesRoles: ({
            rol: {
                id: number;
                rolDescripcion: string;
            };
        } & {
            rolId: number;
            reporteId: number;
        })[];
    } & {
        id: number;
        titulo: string;
        descripcion: string | null;
        urlIframe: string;
        activo: boolean;
        fechaRegistro: Date;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
