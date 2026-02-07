import {
  IsArray,
  IsNumber,
  IsNotEmpty,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

// 1. DTO para cada item dentro del carrito
export class CreateVentaDetalleDto {
  @IsNumber()
  @IsNotEmpty()
  idProducto: number;

  @IsNumber()
  @Min(1, { message: 'La cantidad mínima es 1' })
  cantidad: number;
}

// 2. DTO principal que recibe el controlador
export class CreateVentaDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateVentaDetalleDto)
  items: CreateVentaDetalleDto[];
}
