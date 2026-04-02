import { IsString, IsBoolean, IsOptional, IsArray, IsInt, Matches } from 'class-validator';

export class UpdateReportDto {
  @IsString()
  @IsOptional()
  titulo?: string;

  @IsString()
  @Matches(/^https:\/\//, {
    message: 'La URL del iframe debe comenzar con https://',
  })
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
