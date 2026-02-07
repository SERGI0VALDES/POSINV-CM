import { Controller, Post, Body, Get } from '@nestjs/common';
import { VentasService } from '../services/ventas.service';
import { CreateVentaDto } from '../dto/crear-venta.dto';

@Controller('ventas')
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  @Post()
  async crearVenta(@Body() createVentaDto: CreateVentaDto) {
    // Pasamos el array de items al servicio
    return await this.ventasService.procesarVenta(createVentaDto.items);
  }

  @Get()
  async listarVentas() {
    return await this.ventasService.obtenerVentas();
  }
}
