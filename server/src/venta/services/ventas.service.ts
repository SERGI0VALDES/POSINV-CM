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

  async procesarVenta(carrito: any[], porcentajeDescuento: number = 0) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let totalVenta = 0;
      const detalles: DetalleVenta[] = [];

      // 1. CALCULAR TOTAL Y VALIDAR STOCK
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

        // Crear detalle
        const detalle = new DetalleVenta();
        detalle.idProducto = producto.idProducto;
        detalle.cantidad = item.cantidad;
        detalle.precioUnitario = producto.precioVenta;
        detalle.subtotal = subtotal;
        detalles.push(detalle);
      }

      // 2. CALCULAR DESCUENTO SOBRE EL TOTAL (fuera del loop)
      const montoDescuento = totalVenta * (porcentajeDescuento / 100);
      const totalFinal = totalVenta - montoDescuento;

      // 3. CREAR VENTA CON DESCUENTO (SOLO UNA VEZ)
      const nuevaVenta = queryRunner.manager.create(Venta, {
        total: totalFinal, // Total CON descuento
        subtotal: totalVenta, // Total SIN descuento (opcional, pero útil)
        porcentajeDescuento: porcentajeDescuento,
        montoDescuento: montoDescuento,
        fecha: new Date(),
        estado: 'completada',
      });

      const ventaGuardada = await queryRunner.manager.save(nuevaVenta);

      // 4. GUARDAR DETALLES Y ACTUALIZAR STOCK
      for (const det of detalles) {
        det.idVenta = ventaGuardada.idVenta;
        await queryRunner.manager.save(det);

        // Descontar stock
        await queryRunner.manager.decrement(
          ProductoBase,
          { idProducto: det.idProducto },
          'stockActual',
          det.cantidad,
        );

        // Registrar movimiento
        const codigoMov = `V-${Date.now()}-${det.idProducto}`;
        await queryRunner.manager.save(MovimientoInventario, {
          idMovimiento: codigoMov,
          tipoMovimiento: 'salida',
          cantidad: det.cantidad,
          observaciones: `Venta POS #${ventaGuardada.idVenta}`,
          fechaMovimiento: new Date(),
          idUsuario: 1,
          producto: { idProducto: det.idProducto } as any,
        });
      }

      await queryRunner.commitTransaction();

      return {
        success: true,
        idVenta: ventaGuardada.idVenta,
        subtotal: totalVenta, // Sin descuento
        descuento: montoDescuento,
        total: totalFinal, // Con descuento
        porcentajeDescuento: porcentajeDescuento,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
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
