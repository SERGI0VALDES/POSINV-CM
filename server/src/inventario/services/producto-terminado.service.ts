import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Like } from 'typeorm';
import { ProductoBase } from '../entities/producto-base.entity';
import { ProductoTerminado } from '../entities/producto-terminado.entity';
import { CrearProductoTerminadoDto } from '../dto/crear-producto-terminado.dto';

@Injectable()
export class ProductoTerminadoService {
  constructor(
    @InjectRepository(ProductoTerminado)
    private readonly prodTerminadoRepo: Repository<ProductoTerminado>,
    private readonly dataSource: DataSource,
  ) {}

  // Equivale al getAll() con JOIN
  async obtenerTodos() {
    return await this.prodTerminadoRepo.find({
      relations: ['producto'],
      where: { producto: { activo: 1 } },
      order: { producto: { nombre: 'ASC' } },
    });
  }

  // Crear con Transacción
  async crear(dto: CrearProductoTerminadoDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const nuevoProductoBase = queryRunner.manager.create(ProductoBase, {
        idProducto: dto.idProducto,
        nombre: dto.nombre,
        stockActual: dto.stockActual || 0,
        stockMinimo: dto.stockMinimo || 0,
        precioVenta: dto.precioVenta,
        activo: 1,
      });
      await queryRunner.manager.save(nuevoProductoBase);

      const nuevoProdTerminado = queryRunner.manager.create(ProductoTerminado, {
        codigoSku: dto.codigoSku,
        tipoProducto: dto.tipoProducto,
        producto: nuevoProductoBase,
      });
      const resultado = await queryRunner.manager.save(nuevoProdTerminado);

      await queryRunner.commitTransaction();
      return resultado;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // Buscar por SKU
  async obtenerPorSku(sku: string) {
    const item = await this.prodTerminadoRepo.findOne({
      where: { codigoSku: sku },
      relations: ['producto'],
    });
    if (!item) throw new NotFoundException('Producto con SKU no encontrado');
    return item;
  }

  // Búsqueda por nombre (Equivale al search)
  async buscarPorNombre(nombre: string) {
    return await this.prodTerminadoRepo.find({
      where: { producto: { nombre: Like(`%${nombre}%`), activo: 1 } },
      relations: ['producto'],
    });
  }

  // Obtener stock bajo
  async obtenerBajoStock() {
    return await this.prodTerminadoRepo
      .createQueryBuilder('pt')
      .leftJoinAndSelect('pt.producto', 'pb')
      .where('pb.stockActual <= pb.stockMinimo')
      .andWhere('pb.activo = 1')
      .getMany();
  }
}
