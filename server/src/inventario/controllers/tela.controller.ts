import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TelaService } from '../services/tela.service';
import { CrearTelaDto } from '../dto/crear-tela.dto';

@Controller('telas')
export class TelaController {
  constructor(private readonly telaService: TelaService) {}

  // 1. Obtener todas las telas (Lista general con stock y precios)
  @Get()
  async findAll() {
    return await this.telaService.obtenerTodas();
  }

  // 2. Estadísticas globales (Valor del inventario, metros totales, etc.)
  @Get('estadisticas')
  async getStats() {
    return await this.telaService.obtenerEstadisticas();
  }

  // 3. Telas con longitud baja (Rollos que se están acabando)
  // GET /telas/baja-longitud?min=10
  @Get('baja-longitud')
  async getLowLength(@Query('min') min?: number) {
    return await this.telaService.obtenerBajaLongitud(min);
  }

  // 4. Buscar por composición (Ej: "Algodón", "Lycra")
  // GET /telas/buscar?composicion=algodon
  @Get('buscar')
  async findByComposition(@Query('composicion') composicion: string) {
    return await this.telaService.buscarPorComposicion(composicion);
  }

  // 5. Crear Tela + Producto Base (Transaccional)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CrearTelaDto) {
    return await this.telaService.crear(dto);
  }

  // 6. Eliminar (Desactivar producto base)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.telaService.eliminar(id);
  }
}
