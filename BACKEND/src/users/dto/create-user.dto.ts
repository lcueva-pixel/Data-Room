import { IsEmail, IsString, MinLength, IsInt, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  nombreCompleto: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsInt()
  rolId: number;

  @IsOptional()
  activo?: boolean;
}
