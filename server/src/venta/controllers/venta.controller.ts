import { Controller, Post, Body, Get } from '@nestjs/common';
import { VentasService } from '../services/ventas.service';
import { CreateVentaDto } from '../dto/crear-venta.dto';

@Controller('ventas')
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  @Post()
  async crearVenta(@Body() createVentaDto: CreateVentaDto) {
    // Ahora pasamos los dos argumentos que pide tu nuevo servicio
    return await this.ventasService.procesarVenta(
      createVentaDto.items,
      createVentaDto.porcentajeDescuento || 0,
    );
  }

  @Get()
  async listarVentas() {
    return await this.ventasService.obtenerVentas();
  }
}
