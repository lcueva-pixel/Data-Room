import { IsString, IsBoolean, IsOptional, IsArray, IsInt, ArrayMinSize, Matches } from 'class-validator';

export class CreateReportDto {
  @IsString()
  titulo: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @Matches(/^https:\/\//, {
    message: 'La URL del iframe debe comenzar con https://',
  })
  urlIframe: string;

  @IsArray()
  @IsInt({ each: true })
  @ArrayMinSize(1, { message: 'Selecciona al menos un rol' })
  rolesIds: number[];

  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @IsInt()
  @IsOptional()
  padreId?: number | null;
}
