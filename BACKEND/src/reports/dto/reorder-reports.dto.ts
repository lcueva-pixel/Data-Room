import {
  IsArray,
  IsInt,
  IsOptional,
  ArrayMinSize,
  ValidateIf,
} from 'class-validator';

export class ReorderReportsDto {
  // null indica el nivel raíz (reportes sin padre); undefined no se acepta.
  @ValidateIf((_, v) => v !== null)
  @IsInt()
  @IsOptional()
  padreId: number | null;

  @IsArray()
  @ArrayMinSize(1, { message: 'Se requiere al menos un reporte para reordenar' })
  @IsInt({ each: true })
  orderedIds: number[];
}
