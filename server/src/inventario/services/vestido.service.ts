import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'; // <--- Faltaba esta
import { Repository, DataSource } from 'typeorm'; // <--- Faltaba Repository
import { ProductoBase } from '../entities/producto-base.entity';
import { Vestido } from '../entities/vestido.entity';
import { CrearVestidoDto } from '../dto/create-vestido.dto';

@Injectable()
export class VestidosService {
  constructor(
    @InjectRepository(Vestido)
    private readonly vestidoRepository: Repository<Vestido>,

    // Necesitas inyectar el DataSource para usar los QueryRunners (transacciones)
    private readonly dataSource: DataSource,
  ) {}

  // OBTENER TODOS
  async findAll() {
    try {
      return await this.vestidoRepository.find({
        // Esto hace un "JOIN" con la tabla ProductoBase
        relations: ['producto'],
        order: { idProducto: 'ASC' },
      });
    } catch (error) {
      throw new Error(`Error al obtener vestidos: ${error.message}`);
    }
  }

  // CREATE
  async crear(dto: CrearVestidoDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const producto = queryRunner.manager.create(ProductoBase, dto);
      const guardado = await queryRunner.manager.save(producto);

      const vestido = queryRunner.manager.create(Vestido, {
        ...dto,
        idProducto: guardado.idProducto,
      });

      await queryRunner.manager.save(vestido);
      await queryRunner.commitTransaction();
      return { success: true };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async eliminar(id: number) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Eliminar primero el hijo (Vestido)
      await queryRunner.manager.delete(Vestido, { idProducto: id });
      // Luego el padre (ProductoBase)
      await queryRunner.manager.delete(ProductoBase, { idProducto: id });

      await queryRunner.commitTransaction();
      return { success: true };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // UPDATE
  async actualizar(id: number, dto: Partial<CrearVestidoDto>) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(ProductoBase, id, {
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        stockActual: dto.stockActual,
        precioVenta: dto.precioVenta,
      });

      await queryRunner.manager.update(
        Vestido,
        { idProducto: id },
        {
          color: dto.color,
          codigoSku: dto.codigoSku, // Ojo: verifica si es codigoSku o skuVestido en tu entidad
          categoria: dto.categoria,
        },
      );

      await queryRunner.commitTransaction();
      return { success: true };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
