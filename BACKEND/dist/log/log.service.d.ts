import { PrismaService } from '../prisma/prisma.service';
import { LogActivityRecord } from './types/log.types';
export declare class LogService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        usuario: {
            nombreCompleto: string;
            email: string;
        };
    } & {
        id: number;
        fechaHora: Date;
        usuarioId: number;
        accion: string;
        detalle: string | null;
    })[]>;
    register(record: LogActivityRecord): Promise<{
        id: number;
        fechaHora: Date;
        usuarioId: number;
        accion: string;
        detalle: string | null;
    }>;
}
