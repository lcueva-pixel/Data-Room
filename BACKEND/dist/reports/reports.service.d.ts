import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ListReportsQueryDto } from './dto/list-reports-query.dto';
export declare class ReportsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByRole(rolId: number): Promise<({
        children: ({
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
                titulo: string;
                descripcion: string | null;
                urlIframe: string;
                activo: boolean;
                fechaRegistro: Date;
                padreId: number | null;
            })[];
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
            padreId: number | null;
        })[];
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
        padreId: number | null;
    })[]>;
    findChildren(parentId: number): Promise<({
        reportesRoles: ({
            rol: {
                id: number;
                rolDescripcion: string;
            };
        } & {
            rolId: number;
            reporteId: number;
        })[];
        _count: {
            children: number;
        };
    } & {
        id: number;
        titulo: string;
        descripcion: string | null;
        urlIframe: string;
        activo: boolean;
        fechaRegistro: Date;
        padreId: number | null;
    })[]>;
    findAllAdmin(query: ListReportsQueryDto): Promise<import("../common/dto/paginated-response.dto").PaginatedResponse<{
        padre: {
            id: number;
            titulo: string;
        } | null;
        reportesRoles: ({
            rol: {
                id: number;
                rolDescripcion: string;
            };
        } & {
            rolId: number;
            reporteId: number;
        })[];
        _count: {
            children: number;
        };
    } & {
        id: number;
        titulo: string;
        descripcion: string | null;
        urlIframe: string;
        activo: boolean;
        fechaRegistro: Date;
        padreId: number | null;
    }>>;
    create(dto: CreateReportDto): Promise<{
        message: string;
    }>;
    update(id: number, dto: UpdateReportDto): Promise<{
        message: string;
    }>;
    toggleActivo(id: number): Promise<{
        padre: {
            id: number;
            titulo: string;
        } | null;
        reportesRoles: ({
            rol: {
                id: number;
                rolDescripcion: string;
            };
        } & {
            rolId: number;
            reporteId: number;
        })[];
        _count: {
            children: number;
        };
    } & {
        id: number;
        titulo: string;
        descripcion: string | null;
        urlIframe: string;
        activo: boolean;
        fechaRegistro: Date;
        padreId: number | null;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
