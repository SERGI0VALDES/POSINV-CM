import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ProductoTerminadoService } from '../services/producto-terminado.service';
import { CrearProductoTerminadoDto } from '../dto/crear-producto-terminado.dto';

@Controller('productos-terminados')
export class ProductoTerminadoController {
  constructor(private readonly productoService: ProductoTerminadoService) {}

  // 1. Obtener todos (Lista maestra de ropa/artículos finales)
  @Get()
  async findAll() {
    return await this.productoService.obtenerTodos();
  }

  // 2. Alertas de Stock Bajo (Específico para productos terminados)
  @Get('stock-bajo')
  async getLowStock() {
    return await this.productoService.obtenerBajoStock();
  }

  // 3. Buscar por SKU (Importante para lectores de barras)
  // GET /productos-terminados/sku/VEST-001
  @Get('sku/:sku')
  async findBySku(@Param('sku') sku: string) {
    return await this.productoService.obtenerPorSku(sku);
  }

  // 4. Buscar por Nombre (Buscador del frontend)
  // GET /productos-terminados/buscar?nombre=vestido
  @Get('buscar')
  async search(@Query('nombre') nombre: string) {
    return await this.productoService.buscarPorNombre(nombre);
  }

  // 5. Crear Producto Terminado + Producto Base
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CrearProductoTerminadoDto) {
    return await this.productoService.crear(dto);
  }
}
