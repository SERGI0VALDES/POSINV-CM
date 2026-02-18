import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  ProductoBase,
  TipoProducto,
} from '../inventario/entities/producto-base.entity';
import { MovimientoInventario } from './entities/movimiento-inventario.entity';
//import { RegistrarMovimientoDto } from './dto/registrar-movimiento.dto';
import { Tela } from './entities/tela.entity'; // Asegúrate de que la ruta sea correcta

@Injectable()
export class InventarioService {
  constructor(
    @InjectRepository(ProductoBase)
    private readonly productoRepo: Repository<ProductoBase>,

    @InjectRepository(Tela) // <--- Agregamos esto
    private readonly telaRepo: Repository<Tela>,

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
      // Cambiamos 'int' por 'idProducto'
      where: { idProducto: id },
    });

    if (!producto) throw new NotFoundException('Producto no encontrado');
    return producto;
  }

  async eliminar(id: number) {
    return await this.productoRepo.delete({ idProducto: id });
  }

  async actualizar(id: number, data: any) {
    return await this.productoRepo.update({ idProducto: id }, data);
  }

  // --- MÉTODOS DE MOVIMIENTOS ---

  async obtenerHistorial() {
    return await this.movRepo.find({
      relations: ['producto'],
      order: { fechaMovimiento: 'DESC' },
      take: 100,
    });
  }

  async obtenerPorProducto(idProducto: number) {
    return await this.movRepo.find({
      where: { producto: { idProducto } },
      relations: ['producto'],
      order: { fechaMovimiento: 'DESC' },
    });
  }

  // inventario.service.ts

  async obtenerResumenDashboard() {
    const vestidos = await this.productoRepo.count({
      where: { tipoProducto: TipoProducto.VESTIDO },
    });
    const terminados = await this.productoRepo.count({
      where: { tipoProducto: TipoProducto.TERMINADO },
    });

    const cantidadTipos = await this.telaRepo.count();

    // Usar COALESCE para manejar NULL
    const sumaRollos = await this.telaRepo
      .createQueryBuilder('t')
      .select('COALESCE(SUM(t.stockRollo), 0)', 'totalSuma')
      .getRawOne();

    return {
      vestidos,
      terminados,
      telas: cantidadTipos,
      totalRollos: Number(sumaRollos?.totalSuma || 0),
    };
  }
}
