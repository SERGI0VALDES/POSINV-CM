// src/pedidos/dto/crear-pedido-unico.dto.ts
import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  MaxLength,
  IsPositive,
} from 'class-validator';

export class CrearPedidoUnicoDto {
  @IsString()
  @MaxLength(200)
  nombreProducto: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber()
  @IsPositive()
  precioUnitario: number;

  @IsNumber()
  @Min(1)
  cantidad: number;

  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsString()
  @IsOptional()
  clienteNombre?: string;

  @IsString()
  @IsOptional()
  clienteTelefono?: string;
}

// src/pedidos/dto/actualizar-estado.dto.ts
export class ActualizarEstadoDto {
  @IsString()
  estado: 'pendiente' | 'en_proceso' | 'completado' | 'entregado';

  @IsString()
  @IsOptional()
  observaciones?: string;
}

// src/pedidos/dto/procesar-pedidos-venta.dto.ts
import { Type } from 'class-transformer';
import { ValidateNested, IsArray } from 'class-validator';

export class ProcesarPedidosVentaDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CrearPedidoUnicoDto)
  pedidos: CrearPedidoUnicoDto[];

  @IsNumber()
  @IsOptional()
  idVenta?: number;
}
