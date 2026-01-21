import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ProductoBase } from '../entities/producto-base.entity';
import { Insumo } from '../entities/insumo.entity';
import { CrearInsumoDto } from '../dto/crear-insumo.dto';

@Injectable()
export class InsumoService {
  constructor(
    @InjectRepository(ProductoBase)
    private productoRepo: Repository<ProductoBase>,
    @InjectRepository(Insumo)
    private insumoRepo: Repository<Insumo>,
    private dataSource: DataSource,
  ) {}

  // Obtener todos los activos (Equivale al JOIN del antiguo controlador)
  async obtenerTodos() {
    return await this.insumoRepo.find({
      relations: ['producto'],
      where: { producto: { activo: 1 } },
      order: { producto: { nombre: 'ASC' } },
    });
  }

  // Crear con Transacción (Garantiza integridad de datos)
  async crear(dto: CrearInsumoDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Crear Producto Base
      const nuevoProducto = queryRunner.manager.create(ProductoBase, {
        idProducto: dto.idProducto,
        nombre: dto.nombre,
        stockActual: dto.stockActual,
        stockMinimo: dto.stockMinimo,
        precioVenta: dto.precioVenta,
      });
      await queryRunner.manager.save(nuevoProducto);

      // 2. Crear Insumo vinculado
      const nuevoInsumo = queryRunner.manager.create(Insumo, {
        nombreInsumo: dto.nombreInsumo,
        unidadMedida: dto.unidadMedida,
        ancho: dto.ancho,
        longitudTotal: dto.longitudTotal,
        producto: nuevoProducto,
      });
      const resultado = await queryRunner.manager.save(nuevoInsumo);

      await queryRunner.commitTransaction();
      return resultado;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // Lógica de Stock Bajo
  async obtenerStockBajo() {
    return await this.insumoRepo
      .createQueryBuilder('insumo')
      .leftJoinAndSelect('insumo.producto', 'producto')
      .where('producto.stockActual <= producto.stockMinimo')
      .andWhere('producto.activo = 1')
      .getMany();
  }

  // Calcular Metros Totales (Agregación)
  async calcularMetrosTotales() {
    const resultado = await this.insumoRepo
      .createQueryBuilder('insumo')
      .leftJoin('insumo.producto', 'producto')
      .select('SUM(insumo.longitudTotal)', 'totalMetros')
      .addSelect('COUNT(*)', 'totalInsumos')
      .where("insumo.unidadMedida = 'metro'")
      .andWhere('producto.activo = 1')
      .getRawOne();

    return resultado;
  }
}
