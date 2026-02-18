import { Type } from 'class-transformer';
import { IsArray, IsNumber, ValidateNested, IsNotEmpty } from 'class-validator';
import { CrearPedidoUnicoDto } from './crear-pedido.dto';

export class ProcesarPedidosVentaDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CrearPedidoUnicoDto)
  @IsNotEmpty()
  pedidos: CrearPedidoUnicoDto[];

  @IsNumber()
  @IsNotEmpty()
  idVenta: number;
}
