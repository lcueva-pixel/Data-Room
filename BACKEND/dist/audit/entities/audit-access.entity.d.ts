import { User } from '../../users/entities/user.entity';
export declare class AuditAccess {
    id: number;
    usuarioId: number;
    usuario: User;
    fechaHora: Date;
    ipAddress: string;
    userAgent: string;
}
