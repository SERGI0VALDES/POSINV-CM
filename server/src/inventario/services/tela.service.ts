import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Like } from 'typeorm';
import { Tela } from '../entities/tela.entity';
import { ProductoBase } from '../entities/producto-base.entity';
import { CrearTelaDto } from '../dto/crear-tela.dto';

@Injectable()
export class TelaService {
  constructor(
    @InjectRepository(Tela)
    private readonly telaRepo: Repository<Tela>,
    private readonly dataSource: DataSource,
  ) {}

  async obtenerTodas() {
    return await this.telaRepo.find({
      relations: ['producto'],
      where: { producto: { activo: 1 } },
      order: { producto: { nombre: 'ASC' } },
    });
  }

  async crear(dto: CrearTelaDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const productoBase = queryRunner.manager.create(ProductoBase, {
        idProducto: dto.idProducto,
        nombre: dto.nombre,
        stockActual: dto.stockActual,
        stockMinimo: dto.stockMinimo,
        precioVenta: dto.precioVenta,
        activo: 1,
      });
      await queryRunner.manager.save(productoBase);

      const nuevaTela = queryRunner.manager.create(Tela, {
        composicion: dto.composicion,
        ancho: dto.ancho,
        longitudTotal: dto.longitudTotal,
        producto: productoBase,
      });
      const resultado = await queryRunner.manager.save(nuevaTela);

      await queryRunner.commitTransaction();
      return resultado;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async obtenerEstadisticas() {
    return await this.telaRepo
      .createQueryBuilder('t')
      .leftJoin('t.producto', 'pb')
      .select('COUNT(*)', 'totalTelas')
      .addSelect('SUM(t.longitudTotal)', 'metrosTotales')
      .addSelect('AVG(t.ancho)', 'anchoPromedio')
      .addSelect('SUM(pb.stockActual * pb.precioVenta)', 'valorInventario')
      .where('pb.activo = 1')
      .getRawOne();
  }

  async obtenerBajaLongitud(min: number = 5) {
    return await this.telaRepo
      .createQueryBuilder('t')
      .leftJoinAndSelect('t.producto', 'pb')
      .where('t.longitudTotal <= :min', { min })
      .andWhere('pb.activo = 1')
      .orderBy('t.longitudTotal', 'ASC')
      .getMany();
  }

  async buscarPorComposicion(termino: string) {
    return await this.telaRepo.find({
      where: { composicion: Like(`%${termino}%`), producto: { activo: 1 } },
      relations: ['producto'],
    });
  }

  async eliminar(id: number) {
    const tela = await this.telaRepo.findOne({
      where: { id },
      relations: ['producto'],
    });
    if (!tela) throw new NotFoundException('Tela no encontrada');

    // Desactivamos el producto base (Soft Delete)
    await this.dataSource
      .createQueryBuilder()
      .update(ProductoBase)
      .set({ activo: 0 })
      .where('idProducto = :id', { id: tela.producto.idProducto })
      .execute();

    return { success: true, message: 'Tela desactivada correctamente' };
  }
}
