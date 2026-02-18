import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venta, DetalleVenta } from './entities/venta.entity';
import { VentasService } from '../venta/services/ventas.service';
import { VentasController } from '../venta/controllers/venta.controller';
import { ProductoBase } from '../inventario/entities/producto-base.entity';
import { PedidoUnico } from '../pedidos/entities/pedido.entity';
import { MovimientoInventario } from '../inventario/entities/movimiento-inventario.entity';

@Module({
  imports: [
    // Registramos las entidades de Ventas Y las que necesitamos consultar del inventario
    TypeOrmModule.forFeature([
      Venta,
      DetalleVenta,
      ProductoBase,
      MovimientoInventario,
      PedidoUnico,
    ]),
  ],
  providers: [VentasService],
  controllers: [VentasController],
})
export class VentasModule {}
