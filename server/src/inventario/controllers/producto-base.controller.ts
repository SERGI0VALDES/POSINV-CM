import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ProductoBaseService } from '../services/producto-base.service';

@Controller('productos-maestro') // Nombre distinto para no chocar con los específicos
export class ProductoBaseController {
  constructor(private readonly service: ProductoBaseService) {}

  @Get()
  getAll() {
    return this.service.findAll();
  }

  @Get('bajo-stock')
  getAlerts() {
    return this.service.getBajoStock();
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: any) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.softDelete(id);
  }
}
