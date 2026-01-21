// dto/registrar-movimiento.dto.ts
import { IsString, IsNumber, IsIn, IsOptional } from 'class-validator';

export class RegistrarMovimientoDto {
  @IsString()
  idMovimiento: string;

  @IsIn(['entrada', 'salida', 'ajuste'])
  tipoMovimiento: 'entrada' | 'salida' | 'ajuste';

  @IsNumber()
  cantidad: number;

  @IsString()
  @IsOptional()
  origen?: string;

  @IsNumber()
  idProducto: number;

  @IsNumber()
  idUsuario: number;

  @IsString()
  @IsOptional()
  observaciones?: string;
}
