import { IsString, IsBoolean, IsOptional, IsArray, IsInt } from 'class-validator';

export class UpdateReportDto {
  @IsString()
  @IsOptional()
  titulo?: string;

  @IsString()
  @IsOptional()
  urlIframe?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  rolesIds?: number[];

  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @IsInt()
  @IsOptional()
  padreId?: number | null;
}
