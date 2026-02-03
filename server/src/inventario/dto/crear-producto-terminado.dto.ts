// dto/crear-producto-terminado.dto.ts
import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class CrearProductoTerminadoDto {
  @IsOptional() // Debe ser opcional si es auto-generado
  @IsNumber()
  idProducto?: number;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  codigoSku: string;

  @IsOptional()
  @IsNumber()
  stockActual?: number;

  @IsOptional()
  @IsNumber()
  stockMinimo?: number;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsNumber()
  precioVenta: number;

  @IsString()
  @IsOptional()
  categoria?: string;

  @IsOptional()
  @IsNumber()
  activo?: number;
}
