export declare class CreateReportDto {
    titulo: string;
    descripcion?: string;
    urlIframe: string;
    rolesIds: number[];
    activo?: boolean;
    padreId?: number | null;
}
