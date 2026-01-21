import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  async validarUsuario(nombreUsuario: string, pass: string) {
    const usuario = await this.usuarioRepo.findOne({
      where: { nombreUsuario, activo: 1 },
      select: ['id', 'nombreUsuario', 'hashPassword', 'rol'],
    });

    if (usuario && (await bcrypt.compare(pass, usuario.hashPassword))) {
      // Usamos 'any' momentáneamente o casteamos para poder eliminar la propiedad
      const userRes = usuario as any;
      delete userRes.hashPassword; // Borramos la propiedad físicamente del objeto

      return userRes;
    }

    throw new UnauthorizedException('Credenciales inválidas');
  }

  async crear(dto: any) {
    const salt = await bcrypt.genSalt();
    const hash = await bcrypt.hash(dto.hashPassword, salt);

    const nuevo = this.usuarioRepo.create({
      ...dto,
      hashPassword: hash,
    });

    const guardado = await this.usuarioRepo.save(nuevo);

    // Aplicamos lo mismo aquí para no devolver la clave al crear
    const resultado = guardado as any;
    delete resultado.hashPassword;

    return resultado;
  }

  async obtenerTodos() {
    return await this.usuarioRepo.find();
  }

  async eliminar(id: number) {
    return await this.usuarioRepo.delete(id);
  }
}
