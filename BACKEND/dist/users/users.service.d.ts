import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(query: ListUsersQueryDto): Promise<import("../common/dto/paginated-response.dto").PaginatedResponse<{
        id: number;
        nombreCompleto: string;
        email: string;
        rolId: number;
        activo: boolean;
        fechaCreacion: Date;
        rol: {
            rolDescripcion: string;
        };
    }>>;
    create(dto: CreateUserDto): Promise<{
        message: string;
    }>;
    update(id: number, dto: UpdateUserDto): Promise<{
        message: string;
    }>;
    toggleActivo(id: number): Promise<{
        id: number;
        nombreCompleto: string;
        email: string;
        rolId: number;
        activo: boolean;
        fechaCreacion: Date;
        rol: {
            rolDescripcion: string;
        };
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
}
