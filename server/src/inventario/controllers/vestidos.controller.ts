import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Get,
  Delete,
} from '@nestjs/common';
import { VestidosService } from '../services/vestido.service';
import { CrearVestidoDto } from '../dto/create-vestido.dto';

// vestidos.controller.ts
@Controller('vestidos')
export class VestidosController {
  // 1. Aquí defines el nombre: 'service'
  constructor(private readonly service: VestidosService) {}

  @Get()
  findAll() {
    // 2. CAMBIO: Usar 'this.service', no 'this.VestidosService'
    return this.service.findAll();
  }

  @Post()
  async create(@Body() dto: CrearVestidoDto) {
    // Aquí ya lo tenías bien
    return await this.service.crear(dto);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CrearVestidoDto>,
  ) {
    // Aquí también ya lo tenías bien
    return await this.service.actualizar(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.service.eliminar(id);
  }
}
