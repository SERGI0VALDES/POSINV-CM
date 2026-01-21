import {
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

class ItemDto {
  @IsNumber()
  idProducto: number;

  @IsNumber()
  cantidad: number;

  @IsNumber()
  precioUnitario: number;
}

export class CreatePedidoDto {
  @IsString()
  @IsNotEmpty()
  idPedido: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  items: ItemDto[];
}
