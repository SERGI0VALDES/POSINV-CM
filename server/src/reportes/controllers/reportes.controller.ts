import {
  Controller,
  Get,
  Param,
  Res,
  //Query,
  NotFoundException,
} from '@nestjs/common';
import { ReportesService } from '../services/reportes.service';
import { Response } from 'express';
import { join } from 'path';
import * as fs from 'fs';

@Controller('reportes')
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  // Endpoint para que el Dashboard/POS pregunte por cortes no impresos
  @Get('pendientes')
  async obtenerPendientes() {
    return await this.reportesService.buscarCortesSinImprimir();
  }

  // Endpoint para descargar un PDF específico
  @Get('descargar/:nombre')
  descargarPdf(@Param('nombre') nombre: string, @Res() res: Response) {
    const ruta = join(process.cwd(), 'reportes', 'cortes', nombre);
    if (!fs.existsSync(ruta))
      throw new NotFoundException('El archivo no existe');

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${nombre}`);
    const fileStream = fs.createReadStream(ruta);
    fileStream.pipe(res);
  }

  // Nuevo: Endpoint para marcar como impreso y que no vuelva a saltar el aviso
  @Get('marcar-impreso/:idCierre')
  async marcarImpreso(@Param('idCierre') id: number) {
    return await this.reportesService.marcarCorteComoImpreso(id);
  }

  // Nuevo endpoint que llama a la función generarReporteGeneral, para el botón
  @Get('generar-manual')
  async generarManual() {
    const nombreArchivo =
      await this.reportesService.generarReporteGeneral('Manual');
    return {
      ok: true,
      archivo: nombreArchivo,
      url: `/reportes/ver-general/${nombreArchivo}`,
    };
  }

  // Endpoint para visualizar el PDF general
  @Get('ver-general/:nombre')
  async verGeneral(@Param('nombre') nombre: string, @Res() res: Response) {
    const ruta = join(process.cwd(), 'reportes', 'cortes', 'generales', nombre);
    return res.sendFile(ruta);
  }
}
