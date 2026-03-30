import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ListReportsQueryDto } from './dto/list-reports-query.dto';
export declare class ReportsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByRole(rolId: number): Promise<({
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
        activo: boolean;
        titulo: string;
        descripcion: string | null;
        urlIframe: string;
        fechaRegistro: Date;
    }>>;
    create(dto: CreateReportDto): Promise<{
        message: string;
    }>;
    update(id: number, dto: UpdateReportDto): Promise<{
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
        activo: boolean;
        titulo: string;
        descripcion: string | null;
        urlIframe: string;
        fechaRegistro: Date;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
