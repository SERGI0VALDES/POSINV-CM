import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
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

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CrearTelaDto>, // Usamos Partial porque en edición a veces no mandas todo
  ) {
    // Asegúrate de tener el método 'actualizar' definido en tu telaService
    return await this.telaService.actualizar(id, dto);
  }

  // 5. Crear Tela + Producto Base (Transaccional)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CrearTelaDto) {
    return await this.telaService.crear(dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.telaService.eliminar(id);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.telaService.obtenerUna(id);
  }
}
