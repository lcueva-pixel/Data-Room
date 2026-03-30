import { User } from '../../users/entities/user.entity';
export declare class LogActivity {
    id: number;
    usuarioId: number;
    usuario: User;
    accion: string;
    detalle: string;
    fechaHora: Date;
}
