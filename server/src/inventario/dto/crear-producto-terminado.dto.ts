import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CrearProductoTerminadoDto {
  @IsNumber()
  idProducto: number;

  @IsString()
  nombre: string;

  @IsString()
  codigoSku: string;

  @IsString()
  tipoProducto: string;

  @IsNumber()
  @IsOptional()
  stockActual?: number;

  @IsNumber()
  @IsOptional()
  stockMinimo?: number;

  @IsNumber()
  precioVenta: number;
}
