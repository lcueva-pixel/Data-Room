import { IsString, IsBoolean, IsOptional, IsArray, IsInt, ArrayMinSize } from 'class-validator';

export class CreateReportDto {
  @IsString()
  titulo: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  urlIframe: string;

  @IsArray()
  @IsInt({ each: true })
  @ArrayMinSize(1, { message: 'Selecciona al menos un rol' })
  rolesIds: number[];

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
