// src/pedidos/pedidos.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  //  ParseEnumPipe,
} from '@nestjs/common';
import { PedidosService } from '../services/pedido.service';
import { CrearPedidoUnicoDto } from '../dto/crear-pedido.dto';
import { ActualizarEstadoDto } from '../dto/actualizar-estado.dto';
import { ProcesarPedidosVentaDto } from '../dto/procesar-pedidos-venta.dto';

@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  // Crear un pedido único individual
  @Post()
  async crearPedidoUnico(@Body() crearDto: CrearPedidoUnicoDto) {
    return await this.pedidosService.crearPedidoUnico(crearDto);
  }

  // Crear múltiples pedidos únicos (desde POS)
  @Post('batch')
  async crearPedidosBatch(@Body() procesarDto: ProcesarPedidosVentaDto) {
    return await this.pedidosService.crearPedidosUnicos(
      procesarDto.pedidos,
      procesarDto.idVenta,
    );
  }

  // Obtener todos los pedidos
  @Get()
  async obtenerTodos() {
    return await this.pedidosService.obtenerTodos();
  }

  // Obtener pedido por ID
  @Get(':id')
  async obtenerPorId(@Param('id', ParseIntPipe) id: number) {
    return await this.pedidosService.obtenerPorId(id);
  }

  // Obtener pedidos por estado
  @Get('estado/:estado')
  async obtenerPorEstado(
    @Param('estado')
    estado: 'pendiente' | 'en_proceso' | 'completado' | 'entregado',
  ) {
    return await this.pedidosService.obtenerPorEstado(estado);
  }

  // Obtener pedidos por rango de fechas
  @Get('fechas/rango')
  async obtenerPorFechas(
    @Query('inicio') fechaInicio: string,
    @Query('fin') fechaFin: string,
  ) {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    return await this.pedidosService.obtenerPorFechas(inicio, fin);
  }

  // Actualizar estado de un pedido
  @Put(':id/estado')
  async actualizarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() estadoDto: ActualizarEstadoDto,
  ) {
    return await this.pedidosService.actualizarEstado(id, estadoDto);
  }

  // Asociar pedidos a una venta
  @Put('asociar-venta')
  async asociarAVenta(
    @Body('idPedidos') idPedidos: number[],
    @Body('idVenta') idVenta: number,
  ) {
    return await this.pedidosService.asociarAVenta(idPedidos, idVenta);
  }

  // Resumen para dashboard
  @Get('dashboard/resumen')
  async obtenerResumenDashboard() {
    return await this.pedidosService.obtenerResumenDashboard();
  }

  // Eliminar pedido
  @Delete(':id')
  async eliminar(@Param('id', ParseIntPipe) id: number) {
    return await this.pedidosService.eliminar(id);
  }
}
