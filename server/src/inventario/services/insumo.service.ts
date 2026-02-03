import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Insumo } from '../entities/insumo.entity';
import { CrearInsumoDto } from '../dto/crear-insumo.dto';

@Injectable()
export class InsumoService {
  constructor(
    @InjectRepository(Insumo)
    private readonly insumoRepo: Repository<Insumo>,
  ) {}

  async obtenerTodos(): Promise<Insumo[]> {
    return await this.insumoRepo.find({ order: { nombre: 'ASC' } });
  }

  async obtenerUno(id: number): Promise<Insumo> {
    const insumo = await this.insumoRepo.findOne({ where: { id } });
    if (!insumo)
      throw new NotFoundException(`Insumo con ID ${id} no encontrado`);
    return insumo;
  }

  async crear(dto: CrearInsumoDto): Promise<Insumo> {
    const nuevoInsumo = this.insumoRepo.create(dto);
    return await this.insumoRepo.save(nuevoInsumo);
  }

  async actualizar(id: number, dto: Partial<CrearInsumoDto>): Promise<Insumo> {
    const insumo = await this.obtenerUno(id);
    const actualizado = this.insumoRepo.merge(insumo, dto);
    return await this.insumoRepo.save(actualizado);
  }

  async eliminar(id: number): Promise<void> {
    const insumo = await this.obtenerUno(id);
    await this.insumoRepo.remove(insumo);
  }
}
