import {
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
  IsInt,
  ArrayMinSize,
  Matches,
  ValidateIf,
} from 'class-validator';

export class CreateReportDto {
  @IsString()
  titulo: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  // urlIframe es obligatorio si es sub-reporte (padreId != null) o si el padre lo proporcionó.
  // Si es padre y no se proporciona, queda como null (banner del dashboard ausente).
  @ValidateIf(
    (o) =>
      (o.padreId !== undefined && o.padreId !== null) ||
      (o.urlIframe !== undefined && o.urlIframe !== ''),
  )
  @IsString({ message: 'La URL es obligatoria para sub-reportes' })
  @Matches(/^https:\/\//, {
    message: 'La URL del iframe debe comenzar con https://',
  })
  @IsOptional()
  urlIframe?: string;

  @IsArray()
  @IsInt({ each: true })
  @ArrayMinSize(1, { message: 'Selecciona al menos un rol' })
  rolesIds: number[];

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  usuariosIds?: number[];

  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @IsInt()
  @IsOptional()
  padreId?: number | null;
}
