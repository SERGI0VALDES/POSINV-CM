import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between } from 'typeorm';
import { Venta, DetalleVenta } from '../entities/venta.entity';
import { ProductoBase } from '../../inventario/entities/producto-base.entity';
import { MovimientoInventario } from '../../inventario/entities/movimiento-inventario.entity';
import { PedidoUnico } from 'src/pedidos/entities/pedido.entity';

@Injectable()
export class VentasService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Venta)
    private readonly ventaRepo: Repository<Venta>,

    @InjectRepository(PedidoUnico)
    private readonly pedidoRepo: Repository<PedidoUnico>,
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
        // --- LÓGICA PARA PEDIDOS ÚNICOS (MOSTRADOR) ---
        if (!item.idProducto) {
          // Sumamos al total global usando el precio que viene del frontend
          // Usamos Number() para evitar que se concatenen como texto
          const precio = Number(item.precioUnitario || item.precio || 0);
          const cantidad = Number(item.cantidad || 1);

          totalVenta += precio * cantidad;

          // Saltamos la búsqueda en la tabla de productos
          continue;
        }

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

        const detalle = new DetalleVenta();
        detalle.idProducto = producto.idProducto;
        detalle.cantidad = item.cantidad;
        detalle.precioUnitario = producto.precioVenta;
        detalle.subtotal = subtotal;
        detalles.push(detalle);
      }

      // 2. CÁLCULOS DE DESCUENTO
      const montoDescuento = totalVenta * (porcentajeDescuento / 100);
      const totalFinal = totalVenta - montoDescuento;

      // 3. CREAR VENTA
      const nuevaVenta = queryRunner.manager.create(Venta, {
        total: totalFinal,
        subtotal: totalVenta,
        porcentajeDescuento: porcentajeDescuento,
        montoDescuento: montoDescuento,
        fecha: new Date(),
        estado: 'completada',
      });

      const ventaGuardada = await queryRunner.manager.save(nuevaVenta);

      // 4. GUARDAR DETALLES Y ACTUALIZAR STOCK (Solo productos de inventario)
      for (const det of detalles) {
        det.idVenta = ventaGuardada.idVenta;
        await queryRunner.manager.save(det);

        await queryRunner.manager.decrement(
          ProductoBase,
          { idProducto: det.idProducto },
          'stockActual',
          det.cantidad,
        );

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

      // RETORNO DE DATOS (Asegurando nombres exactos para el Ticket)
      return {
        success: true,
        idVenta: ventaGuardada.idVenta,
        subtotal: Number(totalVenta),
        descuento: Number(montoDescuento),
        total: Number(totalFinal),
        porcentajeDescuento: porcentajeDescuento,
        fecha: ventaGuardada.fecha,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // El release siempre va aquí y solo una vez
      await queryRunner.release();
    }
  }

  async obtenerVentas() {
    return await this.ventaRepo.find({
      relations: ['detalles', 'detalles.producto'],
      order: { fecha: 'DESC' },
    });
  }

  /*
   * Métodos para el historial de ventas.
   */

  // 1. Obtener ventas recientes (para la lista del modal)
  async findAllRecientes() {
    return await this.ventaRepo.find({
      order: { idVenta: 'DESC' },
      take: 15, // Solo las últimas 15
      select: ['idVenta', 'fecha', 'total'], // Datos ligeros para la lista
    });
  }

  // 2. Obtener una venta específica con todo su detalle (para reimprimir)
  async findOne(id: number) {
    const venta = await this.ventaRepo.findOne({
      where: { idVenta: id },
      relations: ['detalles', 'detalles.producto'], // ¡Vital para traer el nombre del producto!
    });

    if (!venta) {
      throw new NotFoundException(`La venta #${id} no existe`);
    }

    return venta;
  }

  async findAllHoy() {
    const inicioDia = new Date();
    inicioDia.setHours(0, 0, 0, 0);

    const finDia = new Date();
    finDia.setHours(23, 59, 59, 999);

    return await this.ventaRepo.find({
      where: {
        fecha: Between(inicioDia, finDia),
      },
      order: { idVenta: 'DESC' },
      select: ['idVenta', 'fecha', 'total'],
    });
  }

  // Funciones del dashboard para el dinero y ventas de "Hoy"
  async obtenerResumenHoy() {
    const inicioDia = new Date();
    inicioDia.setHours(0, 0, 0, 0);
    const finDia = new Date();
    finDia.setHours(23, 59, 59, 999);

    const ventasHoy = await this.ventaRepo.find({
      where: { fecha: Between(inicioDia, finDia) },
    });

    const totalDinero = ventasHoy.reduce((acc, v) => acc + Number(v.total), 0);

    return {
      cantidad: ventasHoy.length,
      total: totalDinero,
    };
  }

  /*
   * Métodos para el corte de caja
   */

  async obtenerCorteCajaDiario() {
    const hoy = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD

    // 1. Sumamos el total de la tabla VENTA
    const resumenVentas = await this.ventaRepo
      .createQueryBuilder('venta')
      .select('SUM(venta.total)', 'totalVentas')
      .addSelect('COUNT(venta.idVenta)', 'cantidadVentas')
      .where("DATE(venta.fechaVenta) = DATE('now', 'localtime')")
      .getRawOne();

    // 2. Sumamos los pedidos específicos (para detalle)
    const resumenPedidos = await this.pedidoRepo
      .createQueryBuilder('pedido')
      .select('SUM(pedido.subtotal)', 'totalPedidos')
      .addSelect('COUNT(pedido.idPedido)', 'cantidadPedidos')
      .where("DATE(pedido.fechaPedido) = DATE('now', 'localtime')")
      .getRawOne();

    return {
      fecha: hoy,
      totalGeneral: Number(resumenVentas.totalVentas || 0),
      numVentas: Number(resumenVentas.cantidadVentas || 0),
      detalle: {
        totalPedidos: Number(resumenPedidos.totalPedidos || 0),
        numPedidos: Number(resumenPedidos.cantidadPedidos || 0),
        // La diferencia es lo que se vendió puramente de inventario
        totalInventario:
          Number(resumenVentas.totalVentas || 0) -
          Number(resumenPedidos.totalPedidos || 0),
      },
    };
  }
}
