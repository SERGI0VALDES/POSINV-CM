import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Venta, DetalleVenta } from '../entities/venta.entity';
import { ProductoBase } from '../../inventario/entities/producto-base.entity';
import { MovimientoInventario } from '../../inventario/entities/movimiento-inventario.entity';

@Injectable()
export class VentasService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Venta)
    private readonly ventaRepo: Repository<Venta>,
  ) {}

  async procesarVenta(carrito: any[]) {
    // 1. Crear el QueryRunner para la transacción
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let totalVenta = 0;
      const detalles: DetalleVenta[] = [];

      // 2. Primero calculamos el total y validamos stock de todo el carrito
      for (const item of carrito) {
        const producto = await queryRunner.manager.findOne(ProductoBase, {
          where: { idProducto: item.idProducto },
        });

        if (!producto) {
          throw new NotFoundException(
            `Producto ID ${item.idProducto} no encontrado`,
          );
        }

        if (producto.stockActual < item.cantidad) {
          throw new BadRequestException(
            `Stock insuficiente para: ${producto.nombre}`,
          );
        }

        const subtotal = Number(producto.precioVenta) * item.cantidad;
        totalVenta += subtotal;

        // Creamos el objeto detalle (pero no lo guardamos aún)
        const detalle = new DetalleVenta();
        detalle.idProducto = producto.idProducto;
        detalle.cantidad = item.cantidad;
        detalle.precioUnitario = producto.precioVenta;
        detalle.subtotal = subtotal;
        detalles.push(detalle);
      }

      // 3. Crear y guardar la cabecera de la Venta
      const nuevaVenta = queryRunner.manager.create(Venta, {
        total: totalVenta,
        fecha: new Date(),
        estado: 'completada',
      });
      const ventaGuardada = await queryRunner.manager.save(nuevaVenta);

      // 4. Guardar detalles y actualizar stock/movimientos
      for (const det of detalles) {
        det.idVenta = ventaGuardada.idVenta;
        await queryRunner.manager.save(det);

        // Descontar stock en ProductoBase
        await queryRunner.manager.decrement(
          ProductoBase,
          { idProducto: det.idProducto },
          'stockActual',
          det.cantidad,
        );

        // 2. Registrar el movimiento de salida con TUS campos exactos
        // Generamos un código único para idMovimiento (ej: V-1715632...)
        const codigoMov = `V-${Date.now()}-${det.idProducto}`;
        await queryRunner.manager.save(MovimientoInventario, {
          idMovimiento: codigoMov, // Campo único obligatorio
          tipoMovimiento: 'salida', // 'entrada' | 'salida' | 'ajuste'
          cantidad: det.cantidad, // Cantidad vendida
          observaciones: `Venta POS #${ventaGuardada.idVenta}`, // En lugar de 'motivo'
          fechaMovimiento: new Date(),
          idUsuario: 1, // Usuario por defecto
          producto: { idProducto: det.idProducto } as any,
        });
      }

      // 5. Si todo salió bien, confirmamos (commit)
      await queryRunner.commitTransaction();

      return {
        success: true,
        idVenta: ventaGuardada.idVenta,
        total: totalVenta,
      };
    } catch (error) {
      // Si algo falla, revertimos todo (rollback)
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Liberamos el query runner
      await queryRunner.release();
    }
  }

  async obtenerVentas() {
    return await this.ventaRepo.find({
      relations: ['detalles', 'detalles.producto'],
      order: { fecha: 'DESC' },
    });
  }
}
