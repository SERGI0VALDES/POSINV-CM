import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { PedidoService } from '../services/pedido.service';
import { CreatePedidoDto } from '../dto/create-pedido.dto';

@Controller('pedidos')
export class PedidoController {
  constructor(private readonly pedidoService: PedidoService) {}

  // 1. Obtener todos los pedidos (Equivale a tu v_resumen_pedidos)
  @Get()
  async findAll() {
    return await this.pedidoService.obtenerTodos();
  }

  // 2. Obtener un pedido específico con todos sus detalles (items y nombres de productos)
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.pedidoService.obtenerPorId(id);
  }

  // 3. Crear un nuevo pedido (Inserta cabecera e items en una sola transacción)
  @Post()
  async create(@Body() createPedidoDto: CreatePedidoDto) {
    return await this.pedidoService.crear(createPedidoDto);
  }

  // 4. Actualizar solo el estado del pedido (Patch es mejor que Put para cambios parciales)
  // Ejemplo: PATCH /pedidos/1/estado con Body { "estado": "Completado" }
  @Patch(':id/estado')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('estado') estado: string,
  ) {
    return await this.pedidoService.actualizarEstado(id, estado);
  }

  // 5. Eliminar un pedido (Gracias al Cascade se borrarán sus items)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.pedidoService.eliminar(id);
  }
}
