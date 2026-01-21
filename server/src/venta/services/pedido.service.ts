import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido } from '../entities/pedido.entity';
import { CreatePedidoDto } from '../dto/create-pedido.dto';

@Injectable()
export class PedidoService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepo: Repository<Pedido>,
  ) {}

  async obtenerTodos() {
    return await this.pedidoRepo.find({
      relations: ['items', 'items.producto'],
      order: { fechaVenta: 'DESC' },
    });
  }

  async obtenerPorId(id: number) {
    const pedido = await this.pedidoRepo.findOne({
      where: { id },
      relations: ['items', 'items.producto'],
    });
    if (!pedido) throw new NotFoundException('Pedido no encontrado');
    return pedido;
  }

  async crear(dto: CreatePedidoDto) {
    // Calculamos los subtotales y preparamos el objeto
    const items = dto.items.map((item) => ({
      ...item,
      subtotal: item.cantidad * item.precioUnitario,
      producto: { idProducto: item.idProducto } as any,
    }));

    const nuevoPedido = this.pedidoRepo.create({
      idPedido: dto.idPedido,
      estado: 'Pendiente',
      items: items,
    });

    return await this.pedidoRepo.save(nuevoPedido);
  }

  async actualizarEstado(id: number, estado: string) {
    await this.pedidoRepo.update(id, { estado });
    return this.obtenerPorId(id);
  }

  async eliminar(id: number) {
    return await this.pedidoRepo.delete(id);
  }
}
