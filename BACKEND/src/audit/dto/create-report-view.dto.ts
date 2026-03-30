import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReportViewDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  reporteId: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  duracion: number;
}
