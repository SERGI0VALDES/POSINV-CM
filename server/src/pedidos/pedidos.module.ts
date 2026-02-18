import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PedidosController } from './controllers/pedido.controller';
import { PedidosService } from './services/pedido.service';
import { PedidoUnico } from './entities/pedido.entity';
import { Venta } from '../venta/entities/venta.entity'; // Asegúrate que la ruta a Venta sea correcta

@Module({
  imports: [
    // Registramos las entidades para que el repositorio funcione
    TypeOrmModule.forFeature([PedidoUnico, Venta]),
  ],
  controllers: [PedidosController],
  providers: [PedidosService],
  // Exportamos el servicio por si otros módulos (como Ventas) lo necesitan
  exports: [PedidosService],
})
export class PedidosModule {}
