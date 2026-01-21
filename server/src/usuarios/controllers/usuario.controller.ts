import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import { UsuarioService } from '../services/usuario.service'; // Asegúrate que la ruta sea correcta
import { CreateUserDto } from '../dto/create-user.dto';

@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get()
  async getAll() {
    return await this.usuarioService.obtenerTodos();
  }

  @Post('registro')
  async create(@Body() dto: CreateUserDto) {
    return await this.usuarioService.crear(dto);
  }

  @Post('login')
  async login(@Body() body: any) {
    return await this.usuarioService.validarUsuario(
      body.nombreUsuario,
      body.password,
    );
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    // Corregido: Ahora sí pasamos el id al servicio
    return await this.usuarioService.eliminar(id);
  }
}
