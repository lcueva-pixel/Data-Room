import { Role } from '../../roles/entities/role.entity';
export declare class Report {
    id: number;
    titulo: string;
    descripcion: string;
    urlIframe: string;
    rolMinimoId: number;
    rolMinimo: Role;
    activo: boolean;
    fechaRegistro: Date;
}
