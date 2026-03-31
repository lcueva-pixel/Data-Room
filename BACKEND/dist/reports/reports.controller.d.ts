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
        children: ({
            reportesRoles: ({
                rol: {
                    id: number;
                    rolDescripcion: string;
                };
            } & {
                rolId: number;
                reporteId: number;
            })[];
            children: ({
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
                activo: boolean;
                titulo: string;
                descripcion: string | null;
                urlIframe: string;
                fechaRegistro: Date;
                padreId: number | null;
            })[];
        } & {
            id: number;
            activo: boolean;
            titulo: string;
            descripcion: string | null;
            urlIframe: string;
            fechaRegistro: Date;
            padreId: number | null;
        })[];
    } & {
        id: number;
        activo: boolean;
        titulo: string;
        descripcion: string | null;
        urlIframe: string;
        fechaRegistro: Date;
        padreId: number | null;
    })[]>;
    findAllAdmin(query: ListReportsQueryDto): Promise<import("../common/dto/paginated-response.dto").PaginatedResponse<{
        _count: {
            children: number;
        };
        reportesRoles: ({
            rol: {
                id: number;
                rolDescripcion: string;
            };
        } & {
            rolId: number;
            reporteId: number;
        })[];
        padre: {
            id: number;
            titulo: string;
        } | null;
    } & {
        id: number;
        activo: boolean;
        titulo: string;
        descripcion: string | null;
        urlIframe: string;
        fechaRegistro: Date;
        padreId: number | null;
    }>>;
    findChildren(id: number): Promise<({
        _count: {
            children: number;
        };
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
        activo: boolean;
        titulo: string;
        descripcion: string | null;
        urlIframe: string;
        fechaRegistro: Date;
        padreId: number | null;
    })[]>;
    create(createReportDto: CreateReportDto): Promise<{
        message: string;
    }>;
    update(id: number, updateReportDto: UpdateReportDto): Promise<{
        message: string;
    }>;
    toggleActivo(id: number): Promise<{
        _count: {
            children: number;
        };
        reportesRoles: ({
            rol: {
                id: number;
                rolDescripcion: string;
            };
        } & {
            rolId: number;
            reporteId: number;
        })[];
        padre: {
            id: number;
            titulo: string;
        } | null;
    } & {
        id: number;
        activo: boolean;
        titulo: string;
        descripcion: string | null;
        urlIframe: string;
        fechaRegistro: Date;
        padreId: number | null;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
