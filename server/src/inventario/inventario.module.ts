// D:\POSINVCM\server\src\inventario\inventario.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// Controladores
import { InsumoController } from './controllers/insumo.controller';
import { TelaController } from './controllers/tela.controller';
import { VestidosController } from './controllers/vestidos.controller';
import { ProductoBaseController } from './controllers/producto-base.controller';
import { ProductoTerminadoController } from './controllers/producto-terminado.controller';
import { InventarioController } from '../inventario/inventario.controller';
// Servicios
import { ProductoBaseService } from './services/producto-base.service';
import { ProductoTerminadoService } from './services/producto-terminado.service';
import { InsumoService } from './services/insumo.service';
import { TelaService } from './services/tela.service';
import { InventarioService } from './inventario.service';
import { VestidosService } from './services/vestido.service';
// Entidades involucradas
import { Inventario } from './entities/inventario.entity';
import { MovimientoInventario } from './entities/movimiento-inventario.entity';
import {
  ProductoBase,
  ProductoCompleto,
} from './entities/producto-base.entity';
import { ProductoTerminado } from './entities/producto-terminado.entity';
import { Tela } from './entities/tela.entity';
import { Vestido } from './entities/vestido.entity';
import { Insumo } from './entities/insumo.entity';

@Module({
  imports: [
    // Aquí es donde le decimos a Nest qué entidades usar en este módulo
    TypeOrmModule.forFeature([
      ProductoCompleto,
      ProductoBase,
      MovimientoInventario,
      Insumo,
      Inventario,
      Tela,
      ProductoTerminado,
      Vestido,
    ]),
  ],
  providers: [
    InventarioService,
    ProductoBaseService,
    InsumoService,
    ProductoTerminadoService,
    TelaService,
    VestidosService,
  ],
  controllers: [
    InventarioController,
    TelaController,
    ProductoBaseController,
    InsumoController,
    ProductoTerminadoController,
    VestidosController,
  ],
})
export class InventarioModule {}
