import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CrearTelaDto {
  @IsNumber()
  idProducto: number;

  @IsString()
  nombre: string;

  @IsString()
  composicion: string;

  @IsNumber()
  ancho: number;

  @IsNumber()
  longitudTotal: number;

  @IsNumber()
  @IsOptional()
  stockActual?: number = 0;

  @IsNumber()
  @IsOptional()
  stockMinimo?: number = 0;

  @IsNumber()
  @Min(0)
  precioVenta: number;
}
