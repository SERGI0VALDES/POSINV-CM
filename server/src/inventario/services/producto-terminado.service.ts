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

  /**
   * Obtiene todos los productos terminados activos con sus relaciones
   */
  async obtenerTodos(): Promise<ProductoTerminado[]> {
    return await this.prodTerminadoRepo.find({
      relations: ['producto'],
      where: {
        producto: { activo: 1 },
      },
      order: {
        producto: { nombre: 'ASC' },
      },
    });
  }

  /**
   * Crea un nuevo producto terminado
   */
  async crear(dto: CrearProductoTerminadoDto): Promise<ProductoTerminado> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Crear ProductoBase (NO pasar idProducto si es auto-increment)
      const productoBase = queryRunner.manager.create(ProductoBase, {
        // idProducto: dto.idProducto, // ❌ COMENTAR si es auto-generado
        nombre: dto.nombre,
        descripcion: dto.descripcion || '',
        stockActual: dto.stockActual || 0,
        stockMinimo: dto.stockMinimo || 0,
        precioVenta: dto.precioVenta,
        activo: dto.activo ?? 1, // Usar valor del DTO o 1 por defecto
      });

      const productoBaseGuardado = await queryRunner.manager.save(productoBase);

      // 2. Crear ProductoTerminado
      const productoTerminado = queryRunner.manager.create(ProductoTerminado, {
        codigoSku: dto.codigoSku,
        color: dto.color, // ✅ Asegurar que este campo existe
        idProducto: productoBaseGuardado.idProducto, // Usar ID generado
      });

      await queryRunner.manager.save(productoTerminado);

      // 3. Obtener el objeto completo con relaciones
      const productoCompleto = await queryRunner.manager.findOne(
        ProductoTerminado,
        {
          where: { idProducto: productoBaseGuardado.idProducto },
          relations: ['producto'],
        },
      );

      await queryRunner.commitTransaction();
      return productoCompleto;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error al crear producto:', error.message);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Obtiene un producto terminado por su SKU
   */
  async obtenerPorSku(sku: string): Promise<ProductoTerminado> {
    const producto = await this.prodTerminadoRepo.findOne({
      where: { codigoSku: sku },
      relations: ['producto'],
    });

    if (!producto) {
      throw new NotFoundException(`Producto con SKU '${sku}' no encontrado`);
    }

    return producto;
  }

  /**
   * Busca productos terminados por nombre
   */
  async buscarPorNombre(nombre: string): Promise<ProductoTerminado[]> {
    if (!nombre || nombre.trim().length === 0) {
      return this.obtenerTodos();
    }

    return await this.prodTerminadoRepo.find({
      where: {
        producto: {
          nombre: Like(`%${nombre.trim()}%`),
          activo: 1,
        },
      },
      relations: ['producto'],
    });
  }

  /**
   * Obtiene productos terminados con stock bajo
   */
  async obtenerBajoStock(): Promise<ProductoTerminado[]> {
    return await this.prodTerminadoRepo
      .createQueryBuilder('pt')
      .leftJoinAndSelect('pt.producto', 'pb')
      .where('pb.stockActual <= pb.stockMinimo')
      .andWhere('pb.activo = :activo', { activo: 1 })
      .getMany();
  }

  /**
   * Actualiza un producto terminado
   */
  async actualizar(
    id: number,
    dto: any,
  ): Promise<{ success: boolean; message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Actualizar la parte de PRODUCTO_BASE
      await queryRunner.manager.update(ProductoBase, id, {
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        stockActual: dto.stockActual,
        stockMinimo: dto.stockMinimo,
        precioVenta: dto.precioVenta,
      });

      // 2. Actualizar la parte de PROD_TERMINADO (color, sku)
      await queryRunner.manager.update(
        ProductoTerminado,
        { idProducto: id },
        {
          codigoSku: dto.codigoSku,
          color: dto.color,
          categoria: dto.categoria,
        },
      );

      await queryRunner.commitTransaction();
      return { success: true, message: 'Producto actualizado' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Elimina un producto terminado
   */
  async eliminar(id: number): Promise<{ success: boolean; message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verificar existencia
      const existe = await this.prodTerminadoRepo.findOne({
        where: { producto: { idProducto: id } },
      });

      if (!existe) {
        throw new NotFoundException('Producto no encontrado');
      }

      // Eliminar en orden correcto
      await queryRunner.manager.delete(ProductoTerminado, { idProducto: id });
      await queryRunner.manager.delete(ProductoBase, { idProducto: id });

      await queryRunner.commitTransaction();
      return {
        success: true,
        message: 'Producto eliminado correctamente',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error al eliminar:', error.message);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
