// D:\POSINVCM\server\src\inventario\controllers\producto-base.controller.ts

import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Delete,
  ParseIntPipe,
  Post, // Añadimos Post para poder crear
} from '@nestjs/common';
import { ProductoBaseService } from '../services/producto-base.service';

@Controller('productos-maestro')
export class ProductoBaseController {
  constructor(private readonly service: ProductoBaseService) {}

  @Get()
  async getAll() {
    // Esto devolverá los objetos con el formato de ProductoCompleto (la vista)
    return await this.service.findAll();
  }

  @Post()
  async create(@Body() data: any) {
    // Para crear un nuevo registro en la tabla base
    return await this.service.create(data);
  }

  @Get('bajo-stock')
  async getAlerts() {
    // Asegúrate de tener este método en el service o créalo usando la vista
    return await this.service.getBajoStock();
  }

  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    // Buscamos en la vista para traer los detalles (tela, vestido, etc)
    return await this.service.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    // El update debe hacerse sobre la tabla real (baseRepo en el service)
    return await this.service.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    // El borrado debe ser sobre la tabla real
    return await this.service.remove(id);
  }
}
