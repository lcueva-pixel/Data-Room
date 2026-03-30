import { LogService } from './log.service';
export declare class LogController {
    private readonly logService;
    constructor(logService: LogService);
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
}
