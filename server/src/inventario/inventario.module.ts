import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// Servicios y controladores
import { InventarioService } from '../inventario/inventario.service';
import { InventarioController } from '../inventario/inventario.controller';
import { ProductoBaseController } from '../inventario/controllers/producto-base.controller';
import { ProductoBaseService } from '../inventario/services/producto-base.service'; // Ajusta la ruta del import
// Entidades involucradas
import { ProductoBase } from '../inventario/entities/producto-base.entity';
import { MovimientoInventario } from '../inventario/entities/movimiento-inventario.entity';

@Module({
  imports: [
    // Aquí es donde le decimos a Nest qué entidades usar en este módulo
    TypeOrmModule.forFeature([ProductoBase, MovimientoInventario]),
  ],
  providers: [InventarioService, ProductoBaseService],
  controllers: [InventarioController, ProductoBaseController],
})
export class InventarioModule {}
