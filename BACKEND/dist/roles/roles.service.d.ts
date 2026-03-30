import { PrismaService } from '../prisma/prisma.service';
export declare class RolesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: number;
        rolDescripcion: string;
    }[]>;
}
