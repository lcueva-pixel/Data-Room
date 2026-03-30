import { Role } from '../../roles/entities/role.entity';
export declare class User {
    id: number;
    nombreCompleto: string;
    email: string;
    passwordHash: string;
    rolId: number;
    rol: Role;
    activo: boolean;
    fechaCreacion: Date;
}
