import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CrearInsumoDto {
  @IsNumber()
  idProducto: number;

  @IsString()
  nombre: string; // Para PRODUCTO_BASE

  @IsString()
  nombreInsumo: string; // Para INSUMO

  @IsOptional()
  @IsString()
  unidadMedida?: string;

  @IsOptional()
  @IsNumber()
  ancho?: number;

  @IsOptional()
  @IsNumber()
  longitudTotal?: number;

  @IsNumber()
  @Min(0)
  stockActual: number;

  @IsNumber()
  @Min(0)
  stockMinimo: number;

  @IsNumber()
  @Min(0)
  precioVenta: number;
}
