import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateInventarioDto {
  @IsNumber()
  idProducto: number;

  @IsString()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

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
