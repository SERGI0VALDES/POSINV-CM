import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductoBase } from '../entities/producto-base.entity';

@Injectable()
export class ProductoBaseService {
  constructor(
    @InjectRepository(ProductoBase)
    private readonly repo: Repository<ProductoBase>,
  ) {}

  // Obtener todo el inventario mezclado
  async findAll() {
    return await this.repo.find({
      where: { activo: 1 },
      order: { nombre: 'ASC' },
    });
  }

  async findOne(idProducto: number) {
    const producto = await this.repo.findOne({ where: { idProducto } });
    if (!producto) throw new NotFoundException('Producto no encontrado');
    return producto;
  }

  // Actualización genérica (precio, stock manual, nombre)
  async update(idProducto: number, data: any) {
    await this.repo.update({ idProducto }, data);
    return this.findOne(idProducto);
  }

  // Alerta global de stock
  async getBajoStock() {
    // Busca donde stockActual <= stockMinimo
    return await this.repo
      .createQueryBuilder('pb')
      .where('pb.stockActual <= pb.stockMinimo')
      .andWhere('pb.activo = 1')
      .getMany();
  }

  async softDelete(idProducto: number) {
    return await this.repo.update({ idProducto }, { activo: 0 });
  }
}
