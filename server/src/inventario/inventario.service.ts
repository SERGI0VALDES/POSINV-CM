import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductoBase } from '../inventario/entities/producto-base.entity';
import { MovimientoInventario } from './entities/movimiento-inventario.entity';
import { RegistrarMovimientoDto } from './dto/registrar-movimiento.dto';

@Injectable()
export class InventarioService {
  constructor(
    @InjectRepository(ProductoBase)
    private readonly productoRepo: Repository<ProductoBase>,

    @InjectRepository(MovimientoInventario)
    private readonly movRepo: Repository<MovimientoInventario>,
  ) {}

  // --- MÉTODOS DE PRODUCTOS ---

  async obtenerTodos() {
    // Retorna todos los productos activos con sus detalles (insumo, tela, etc si los tienes relacionados)
    return await this.productoRepo.find({
      where: { activo: 1 },
      order: { nombre: 'ASC' },
    });
  }

  // Filtrar por tipo
  async obtenerPorTipo(tipo: 'entrada' | 'salida' | 'ajuste') {
    return await this.movRepo.find({
      where: { tipoMovimiento: tipo },
      relations: ['producto'],
      order: { fechaMovimiento: 'DESC' },
      take: 50,
    });
  }

  async obtenerPorId(id: number) {
    const producto = await this.productoRepo.findOne({
      where: { int: id }, // O 'idProducto' según tu @PrimaryColumn
    });
    if (!producto) throw new NotFoundException('Producto no encontrado');
    return producto;
  }

  async eliminar(id: number) {
    // Soft delete como en tu controlador antiguo
    return await this.productoRepo.update(id, { activo: 0 });
  }

  // --- MÉTODOS DE MOVIMIENTOS ---

  async obtenerHistorial() {
    return await this.movRepo.find({
      relations: ['producto'],
      order: { fechaMovimiento: 'DESC' },
      take: 100,
    });
  }

  async registrar(dto: RegistrarMovimientoDto) {
    const nuevoMovimiento = this.movRepo.create({
      ...dto,
      producto: { idProducto: dto.idProducto } as any,
    });
    return await this.movRepo.save(nuevoMovimiento);
  }

  async obtenerPorProducto(idProducto: number) {
    return await this.movRepo.find({
      where: { producto: { idProducto } },
      relations: ['producto'],
      order: { fechaMovimiento: 'DESC' },
    });
  }
}
