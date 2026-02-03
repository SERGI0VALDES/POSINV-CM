import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tela } from '../entities/tela.entity';
import { CrearTelaDto } from '../dto/crear-tela.dto';

@Injectable()
export class TelaService {
  constructor(
    @InjectRepository(Tela)
    private readonly telaRepo: Repository<Tela>,
  ) {}
  // 1 Obtener 1
  async obtenerUna(id: number) {
    const tela = await this.telaRepo.findOne({ where: { id } });
    if (!tela) throw new NotFoundException('La tela no existe');
    return tela;
  }

  // 1. OBTENER TODAS
  async obtenerTodas() {
    return await this.telaRepo.find({
      order: { nombreTela: 'ASC' },
    });
  }

  // 2. CREAR (Sin transacciones complicadas)
  async crear(dto: CrearTelaDto) {
    try {
      const nuevaTela = this.telaRepo.create(dto);
      return await this.telaRepo.save(nuevaTela);
    } catch (error) {
      console.error('Error SQLITE:', error);
      throw error;
    }
  }

  // 3. ACTUALIZAR
  async actualizar(id: number, dto: Partial<CrearTelaDto>) {
    const tela = await this.telaRepo.findOne({ where: { id } });

    if (!tela) {
      throw new NotFoundException(`La tela con ID ${id} no existe`);
    }

    // Mezcla los datos actuales con los del DTO
    const telaActualizada = this.telaRepo.merge(tela, dto);
    return await this.telaRepo.save(telaActualizada);
  }

  // 4. ELIMINAR
  async eliminar(id: number) {
    const resultado = await this.telaRepo.delete(id);
    if (resultado.affected === 0)
      throw new NotFoundException('No se encontró la tela');
    return { success: true };
  }
}
