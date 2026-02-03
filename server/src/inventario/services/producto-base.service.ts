import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ProductoBase,
  ProductoCompleto,
} from '../entities/producto-base.entity';

@Injectable()
export class ProductoBaseService {
  constructor(
    // Repositorio de VISTA (solo lectura) - para consultas con joins predefinidos
    @InjectRepository(ProductoCompleto)
    private readonly vistaRepo: Repository<ProductoCompleto>,

    // Repositorio de ENTIDAD base (lectura/escritura) - para operaciones CRUD
    @InjectRepository(ProductoBase)
    private readonly baseRepo: Repository<ProductoBase>,
  ) {}

  /**
   * Obtiene todos los productos con sus relaciones desde la vista materializada
   * Promise<ProductoCompleto[]> Lista de productos completos
   */
  async findAll(): Promise<ProductoCompleto[]> {
    console.log('📡 Consultando vista v_productos_completos...');
    return await this.vistaRepo.find();
  }

  /**
   * Obtiene un producto por ID desde la vista
   * ID del producto a buscar
   * Promise<ProductoCompleto> Producto encontrado
   * NotFoundException si no existe
   */
  async findOne(idProducto: number): Promise<ProductoCompleto> {
    const producto = await this.vistaRepo.findOne({
      where: { idProducto },
    });

    if (!producto) {
      throw new NotFoundException(
        `Producto con ID ${idProducto} no encontrado`,
      );
    }

    return producto;
  }

  /**
   * Crea un nuevo producto base
   * Datos del producto a crear
   * Promise<ProductoBase> Producto creado
   */
  async create(data: Partial<ProductoBase>): Promise<ProductoBase> {
    const nuevoProducto = this.baseRepo.create(data);
    return await this.baseRepo.save(nuevoProducto);
  }

  /**
   * Actualiza un producto existente
   * ID del producto a actualizar
   * Datos parciales para actualizar
   * Promise<ProductoBase> Producto actualizado
   * NotFoundException si no existe
   */
  async update(id: number, data: Partial<ProductoBase>): Promise<ProductoBase> {
    const producto = await this.baseRepo.findOne({
      where: { idProducto: id },
    });

    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }

    // Actualiza solo las propiedades proporcionadas
    Object.assign(producto, data);
    return await this.baseRepo.save(producto);
  }

  /**
   * Elimina un producto por ID (eliminación física)
   * ID del producto a eliminar
   * Promise<void>
   */
  async remove(id: number): Promise<void> {
    const resultado = await this.baseRepo.delete(id);

    if (resultado.affected === 0) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
  }

  /**
   * Obtiene productos con stock actual menor o igual al stock mínimo
   * Solo incluye productos activos (activo = 1)
   * Promise<ProductoCompleto[]> Lista de productos con stock bajo
   */
  async getBajoStock(): Promise<ProductoCompleto[]> {
    console.log('📡 Buscando alertas de stock bajo...');

    return await this.vistaRepo
      .createQueryBuilder('producto')
      .where('producto.stockActual <= producto.stockMinimo')
      .andWhere('producto.activo = :activo', { activo: 1 })
      .getMany();
  }
}
