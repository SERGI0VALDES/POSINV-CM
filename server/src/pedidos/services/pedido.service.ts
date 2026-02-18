// src/pedidos/pedidos.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { PedidoUnico } from '../entities/pedido.entity';
import { CrearPedidoUnicoDto } from '../dto/crear-pedido.dto';
import { ActualizarEstadoDto } from '../dto/actualizar-estado.dto';
import { Venta } from '../../venta/entities/venta.entity';

@Injectable()
export class PedidosService {
  constructor(
    @InjectRepository(PedidoUnico)
    private pedidoRepo: Repository<PedidoUnico>,

    @InjectRepository(Venta)
    private ventaRepo: Repository<Venta>,
  ) {}

  // Crear un pedido único individual
  async crearPedidoUnico(crearDto: CrearPedidoUnicoDto): Promise<PedidoUnico> {
    const subtotal = crearDto.precioUnitario * crearDto.cantidad;

    const pedido = this.pedidoRepo.create({
      ...crearDto,
      subtotal,
      estado: 'pendiente',
      fechaPedido: new Date(),
    });

    return await this.pedidoRepo.save(pedido);
  }

  // Crear múltiples pedidos únicos (desde el POS)
  async crearPedidosUnicos(
    pedidosDto: CrearPedidoUnicoDto[],
    idVenta?: number,
  ): Promise<PedidoUnico[]> {
    // 1. Mapeamos los DTOs a entidades incluyendo el cálculo del subtotal
    const entidadesPedidos = pedidosDto.map((dto) => {
      return this.pedidoRepo.create({
        ...dto,
        // Aseguramos que el subtotal se calcule individualmente
        subtotal: dto.precioUnitario * dto.cantidad,
        estado: 'pendiente',
        fechaPedido: new Date(),
        idVenta: idVenta || null, // Vinculamos a la venta si existe
      });
    });

    // 2. Guardado masivo eficiente
    // Usamos save() pasando el array; TypeORM lo maneja como una transacción interna
    try {
      return await this.pedidoRepo.save(entidadesPedidos);
    } catch (error) {
      throw new BadRequestException(
        'Error al procesar el lote de pedidos: ' + error.message,
      );
    }
  }

  // Obtener todos los pedidos únicos
  async obtenerTodos(): Promise<PedidoUnico[]> {
    return await this.pedidoRepo.find({
      relations: ['venta'],
      order: { fechaPedido: 'DESC' },
    });
  }

  // Obtener pedido por ID
  async obtenerPorId(id: number): Promise<PedidoUnico> {
    const pedido = await this.pedidoRepo.findOne({
      where: { idPedido: id },
      relations: ['venta'],
    });

    if (!pedido) {
      throw new NotFoundException(`Pedido único #${id} no encontrado`);
    }

    return pedido;
  }

  // Obtener pedidos por estado
  async obtenerPorEstado(
    estado: 'pendiente' | 'en_proceso' | 'completado' | 'entregado',
  ): Promise<PedidoUnico[]> {
    return await this.pedidoRepo.find({
      where: { estado },
      relations: ['venta'],
      order: { fechaPedido: 'DESC' },
    });
  }

  // Obtener pedidos por rango de fechas
  async obtenerPorFechas(
    fechaInicio: Date,
    fechaFin: Date,
  ): Promise<PedidoUnico[]> {
    return await this.pedidoRepo.find({
      where: {
        fechaPedido: Between(fechaInicio, fechaFin),
      },
      relations: ['venta'],
      order: { fechaPedido: 'DESC' },
    });
  }

  // Actualizar estado del pedido
  async actualizarEstado(
    id: number,
    estadoDto: ActualizarEstadoDto,
  ): Promise<PedidoUnico> {
    const pedido = await this.obtenerPorId(id);

    pedido.estado = estadoDto.estado;
    if (estadoDto.observaciones) {
      pedido.observaciones = estadoDto.observaciones;
    }

    // Si el estado es 'entregado', registrar fecha de entrega
    if (estadoDto.estado === 'entregado') {
      pedido.fechaEntrega = new Date();
    }

    return await this.pedidoRepo.save(pedido);
  }

  // Asociar pedidos a una venta
  async asociarAVenta(idPedidos: number[], idVenta: number): Promise<void> {
    const venta = await this.ventaRepo.findOne({
      where: { idVenta },
    });

    if (!venta) {
      throw new NotFoundException(`Venta #${idVenta} no encontrada`);
    }

    await this.pedidoRepo.update(
      { idPedido: In(idPedidos) },
      { idVenta: idVenta },
    );
  }

  // Obtener resumen para dashboard
  async obtenerResumenDashboard(): Promise<any> {
    const [pendientes, enProceso, completados, total] = await Promise.all([
      this.pedidoRepo.count({ where: { estado: 'pendiente' } }),
      this.pedidoRepo.count({ where: { estado: 'en_proceso' } }),
      this.pedidoRepo.count({ where: { estado: 'completado' } }),
      this.pedidoRepo.count(),
    ]);

    const ventasHoy = await this.pedidoRepo
      .createQueryBuilder('p')
      .select('SUM(p.subtotal)', 'total')
      .where('DATE(p.fechaPedido) = DATE()')
      .getRawOne();

    return {
      pendientes,
      enProceso,
      completados,
      total,
      ventasHoy: Number(ventasHoy?.total || 0),
    };
  }

  // Eliminar pedido (soft delete o físico según necesites)
  async eliminar(id: number): Promise<void> {
    const pedido = await this.obtenerPorId(id);
    await this.pedidoRepo.remove(pedido);
  }
}
