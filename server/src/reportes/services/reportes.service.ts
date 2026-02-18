import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Raw } from 'typeorm';
import { Venta } from '../../venta/entities/venta.entity';
import { ControlDiario } from '../entities/control-diario.entity';
import { InventarioService } from 'src/inventario/inventario.service';
import * as PDFDocument from 'pdfkit';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class ReportesService implements OnApplicationBootstrap {
  private readonly logger = new Logger(ReportesService.name);
  private readonly carpetaReportes = join(process.cwd(), 'reportes', 'cortes');

  constructor(
    @InjectRepository(Venta) private ventaRepo: Repository<Venta>,
    @InjectRepository(ControlDiario)
    private controlRepo: Repository<ControlDiario>,

    private readonly inventarioService: InventarioService,
  ) {
    this.asegurarCarpeta();
  }

  private asegurarCarpeta() {
    if (!fs.existsSync(this.carpetaReportes)) {
      fs.mkdirSync(this.carpetaReportes, { recursive: true });
    }
  }

  async onApplicationBootstrap() {
    this.logger.log('Servidor iniciado. Verificando cortes pendientes...');
    await this.ejecutarCierreAutomatico();
  }

  @Cron('0 1 19 * * *')
  async handleCronCierre() {
    await this.ejecutarCierreAutomatico();
  }

  async ejecutarCierreAutomatico() {
    const ayer = new Date();
    ayer.setDate(ayer.getDate() - 1);
    const fechaAyer = ayer.toISOString().split('T')[0];

    const cierreExistente = await this.controlRepo.findOne({
      where: { fecha: fechaAyer },
    });

    if (cierreExistente) {
      this.logger.log(`El corte del día ${fechaAyer} ya fue procesado.`);
      return;
    }

    const ventasDia = await this.ventaRepo.find({
      where: {
        fecha: Raw((alias) => `DATE(${alias}) = DATE('${fechaAyer}')`),
      } as any, // El 'as any' ayuda si TypeScript sigue reclamando por el tipo
    });

    if (ventasDia.length > 0) {
      this.logger.log(`Generando cierre para el día: ${fechaAyer}`);

      const total = ventasDia.reduce((acc, v) => acc + Number(v.total), 0);
      const nombrePdf = `Corte_${fechaAyer}.pdf`;

      const nuevoCierre = this.controlRepo.create({
        fecha: fechaAyer,
        totalVendido: total,
        totalInventario: total, // Aquí podrías filtrar los pedidos después
        totalPedidos: 0,
        conteoVentas: ventasDia.length,
        nombreArchivo: nombrePdf,
        impreso: 0,
      });

      const cierreGuardado = await this.controlRepo.save(nuevoCierre);
      await this.generarPdfFisico(cierreGuardado);
    }
  }

  async generarPdfFisico(cierre: ControlDiario): Promise<void> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A5',
        margin: 40,
      });

      const ruta = join(this.carpetaReportes, cierre.nombreArchivo);
      const stream = fs.createWriteStream(ruta);
      doc.pipe(stream);

      // Encabezado corregido
      doc
        .fillColor('#333333')
        .fontSize(20)
        .text('REPORTE DE CIERRE', { align: 'center' });

      doc
        .fontSize(10)
        .text('SISTEMA DE CONTROL DE INVENTARIOS', { align: 'center' })
        .moveDown(1);

      // Línea divisoria
      doc.moveTo(40, doc.y).lineTo(380, doc.y).stroke('#cccccc').moveDown(1);

      // Info del Corte (Usando variables para evitar errores de coordenadas)
      doc.fontSize(11).fillColor('#000000');
      let yActual = doc.y;

      doc.font('Helvetica-Bold').text('Fecha de Corte:', 40, yActual);
      doc.font('Helvetica').text(cierre.fecha, 150, yActual);

      yActual += 15;
      doc.font('Helvetica-Bold').text('ID de Cierre:', 40, yActual);
      doc
        .font('Helvetica')
        .text(`#${cierre.idCierre.toString().padStart(5, '0')}`, 150, yActual);

      doc.moveDown(2);

      // Tabla de Resumen
      const tablaTop = doc.y;
      doc.rect(40, tablaTop, 340, 20).fill('#f2f2f2');
      doc
        .fillColor('#000000')
        .font('Helvetica-Bold')
        .text('CONCEPTO', 50, tablaTop + 5);
      doc.text('TOTAL', 300, tablaTop + 5, { align: 'right' });

      doc.y = tablaTop + 30; // Bajamos el cursor manualmente para los items

      // Filas
      doc.font('Helvetica');
      const conceptos = [
        { desc: 'Ventas de Inventario', monto: cierre.totalInventario },
        { desc: 'Ventas de Pedidos', monto: cierre.totalPedidos },
      ];

      conceptos.forEach((item) => {
        const yFila = doc.y;
        doc.text(item.desc, 50, yFila);
        doc.text(`$${item.monto.toFixed(2)}`, 280, yFila, {
          width: 100,
          align: 'right',
        });
        doc.moveDown(0.5);
      });

      doc.moveDown(1);
      doc.moveTo(40, doc.y).lineTo(380, doc.y).stroke('#eeeeee').moveDown(1);

      // Total General
      doc.fontSize(16).font('Helvetica-Bold').text('TOTAL DEL DÍA:', 40, doc.y);
      doc.text(`$${cierre.totalVendido.toFixed(2)}`, 250, doc.y - 16, {
        width: 130,
        align: 'right',
      });

      doc.end();

      stream.on('finish', () => resolve());
      stream.on('error', (err) => reject(err));
    });
  }

  async buscarCortesSinImprimir() {
    return await this.controlRepo.find({ where: { impreso: 0 } });
  }

  async marcarCorteComoImpreso(id: number) {
    const cierre = await this.controlRepo.findOne({ where: { idCierre: id } });
    if (cierre) {
      cierre.impreso = 1;
      return await this.controlRepo.save(cierre);
    }
  }

  // Reortes
  @Cron('0 0 8 * * 1') // Todos los lunes a las 8:00 AM
  async handleCronSemanal() {
    this.logger.log('Iniciando reporte semanal automático...');
    await this.generarReporteGeneral('Semanal');
  }

  // reportes.service.ts

  async generarReporteGeneral(tipo: 'Semanal' | 'Manual') {
    // 1. Obtener los datos reales de tu InventarioService
    const datosInv = await this.inventarioService.obtenerResumenDashboard();

    const fechaHoy = new Date().toISOString().split('T')[0];
    const nombreArchivo = `Reporte_${tipo}_${fechaHoy}.pdf`;
    const ruta = join(this.carpetaReportes, 'generales', nombreArchivo);

    // Asegurar que la subcarpeta existe
    const subcarpeta = join(this.carpetaReportes, 'generales');
    if (!fs.existsSync(subcarpeta))
      fs.mkdirSync(subcarpeta, { recursive: true });

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const stream = fs.createWriteStream(ruta);
      doc.pipe(stream);

      // --- ENCABEZADO ---
      doc
        .fillColor('#2c3e50')
        .fontSize(22)
        .font('Helvetica-Bold')
        .text(`REPORTE DE INVENTARIO ${tipo.toUpperCase()}`, {
          align: 'center',
        });

      doc
        .fontSize(10)
        .fillColor('#7f8c8d')
        .font('Helvetica')
        .text(`Generado: ${new Date().toLocaleString()}`, { align: 'center' })
        .moveDown(2);

      // --- TABLA DE INVENTARIO ---
      doc.rect(50, doc.y, 500, 25).fill('#2c3e50');
      doc
        .fillColor('#ffffff')
        .fontSize(12)
        .text('ESTADO DE EXISTENCIAS', 60, doc.y + 7);
      doc.moveDown(2).fillColor('#000');

      // Estilo de filas
      const dibujarFila = (
        label: string,
        valor: string | number,
        y: number,
      ) => {
        doc.font('Helvetica-Bold').text(label, 70, y);
        doc
          .font('Helvetica')
          .text(valor.toString(), 400, y, { align: 'right', width: 100 });
        doc
          .moveTo(50, y + 15)
          .lineTo(550, y + 15)
          .stroke('#ecf0f1');
      };

      let currentY = doc.y;
      dibujarFila('Vestidos en Exhibición:', datosInv.vestidos, currentY);
      currentY += 25;
      dibujarFila('Productos Terminados:', datosInv.terminados, currentY);
      currentY += 25;
      dibujarFila('Variedad de Telas:', datosInv.telas, currentY);
      currentY += 25;
      dibujarFila('Total de Rollos en Stock:', datosInv.totalRollos, currentY);

      // --- SECCIÓN DE CRONOGRAMA ---
      doc.moveDown(4);
      doc
        .fontSize(10)
        .fillColor('#2c3e50')
        .font('Helvetica-Bold')
        .text('Información del Sistema:');
      doc
        .font('Helvetica')
        .fillColor('#34495e')
        .text(
          `• Este reporte ${tipo === 'Semanal' ? 'se genera automáticamente cada lunes' : 'ha sido generado manualmente por el usuario'}.`,
        );
      doc.text(
        '• Los datos reflejan el stock físico registrado hasta el momento.',
      );

      doc.end();
      stream.on('finish', () => resolve(nombreArchivo));
      stream.on('error', (err) => reject(err));
    });
  }
}
