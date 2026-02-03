import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  Min,
} from 'class-validator';

export class CrearVestidoDto {
  @IsNumber()
  idProducto: number;

  @IsString()
  @IsNotEmpty({
    message: 'El Código SKU se genera automaticamente con lógica JavaScript',
  })
  codigoSku: string;

  @IsString()
  @IsNotEmpty({
    message: 'El nombre es obligatorio',
  })
  nombre: string;

  @IsString()
  @IsOptional()
  categoria: string;

  @IsString()
  @IsNotEmpty()
  color: string;

  @IsNumber()
  @IsOptional()
  stockActual?: number;

  @IsNumber()
  @Min(0)
  precioVenta: number;

  @IsString()
  @IsOptional()
  descripcion?: string;
}
