import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
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

  // Rutas para el historial de ventas y reimpresion de tickets
  @Get('historial/recientes')
  async getRecientes() {
    return await this.ventasService.findAllHoy();
  }

  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return await this.ventasService.findOne(id);
  }

  // Ruta para la informacion de ventas para el dashboard
  @Get('dashboard/resumen-hoy')
  async getResumen() {
    return await this.ventasService.obtenerResumenHoy();
  }

  // Ruta Corte diario de caja
  @Get('corte-diario')
  async getCorte() {
    return await this.ventasService.obtenerCorteCajaDiario();
  }
}
