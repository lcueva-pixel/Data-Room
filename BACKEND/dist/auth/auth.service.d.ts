import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    validateUser(email: string, password: string, ipAddress: string, userAgent: string): Promise<{
        id: number;
        nombreCompleto: string;
        email: string;
        passwordHash: string;
        rolId: number;
        activo: boolean;
        fechaCreacion: Date;
    }>;
    login(user: {
        id: number;
        rolId: number;
    }): Promise<{
        access_token: string;
        rol_id: number;
    }>;
}
