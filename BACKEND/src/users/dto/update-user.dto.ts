import { IsEmail, IsString, MinLength, IsInt, IsOptional, IsBoolean } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  nombreCompleto?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @IsInt()
  @IsOptional()
  rolId?: number;

  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}
