// dto/create-user.dto.ts
import { IsString, MinLength, IsOptional, IsIn } from 'class-validator';

export class CreateUserDto {
  @IsString()
  nombreUsuario: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  hashPassword: string;

  @IsOptional()
  @IsIn(['admin', 'usuario'])
  rol?: string;
}
