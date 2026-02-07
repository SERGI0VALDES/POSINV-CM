import {
  Controller,
  Get,
  // Post,
  // Body,
  Param,
  Query,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';

import { InventarioService } from '../inventario/inventario.service';
//import { RegistrarMovimientoDto } from './dto/registrar-movimiento.dto';
// Nota: Importa también tu CreateInventarioDto si sigues usándolo para crear productos base

@Controller('inventario')
export class InventarioController {
  constructor(private readonly inventoryService: InventarioService) {}

  // --- SECCIÓN DE MOVIMIENTOS (Basada en tu controlador antiguo) ---

  // GET /inventory/history -> Obtener todos los movimientos (Historial)
  @Get('historialInventario')
  getHistory() {
    return this.inventoryService.obtenerHistorial();
  }

  /* POST /inventory/move -> Registrar una entrada, salida o ajuste
  @Post('inventarioMover')
  registerMovement(@Body() registrarMovimientoDto: RegistrarMovimientoDto) {
    return this.inventoryService.registrar(registrarMovimientoDto);
  }*/

  // GET /inventory/history/product/:id -> Movimientos por producto específico
  @Get('historial/producto/:id')
  getHistoryByProduct(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.obtenerPorProducto(id);
  }

  // GET /inventory/history/type -> Movimientos filtrados por tipo (entrada/salida)
  @Get('historial/tipo')
  getHistoryByType(@Query('tipo') tipo: 'entrada' | 'salida' | 'ajuste') {
    return this.inventoryService.obtenerPorTipo(tipo);
  }

  // --- SECCIÓN DE PRODUCTOS BASE ---

  @Get('todos')
  findAllProducts() {
    // Este llama al método que trae el stock actual de PRODUCTO_BASE
    return this.inventoryService.obtenerTodos();
  }

  @Get(':id')
  findOneProduct(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.obtenerPorId(id);
  }

  @Delete(':id')
  removeProduct(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.eliminar(id);
  }
}
