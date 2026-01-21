import {
  Controller,
  Get,
  Post,
  Body,
  //Query,
  //ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InsumoService } from '../services/insumo.service';
import { CrearInsumoDto } from '../dto/crear-insumo.dto';

@Controller('insumos')
export class InsumoController {
  constructor(private readonly insumoService: InsumoService) {}

  // 1. Obtener todos los insumos (con su relación a ProductoBase)
  @Get()
  async findAll() {
    return await this.insumoService.obtenerTodos();
  }

  // 2. Crear un nuevo Insumo (usa la transacción que definimos)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() crearInsumoDto: CrearInsumoDto) {
    return await this.insumoService.crear(crearInsumoDto);
  }

  // 3. Alertas de Stock Bajo
  // GET /insumos/stock-bajo
  @Get('stock-bajo')
  async getLowStock() {
    return await this.insumoService.obtenerStockBajo();
  }

  // 4. Estadísticas de metros totales
  // GET /insumos/metros-totales
  @Get('metros-totales')
  async getTotalMeters() {
    return await this.insumoService.calcularMetrosTotales();
  }
}
