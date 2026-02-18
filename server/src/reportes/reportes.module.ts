import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportesService } from '../reportes/services/reportes.service';
import { ReportesController } from '../reportes/controllers/reportes.controller';
import { Venta } from '../venta/entities/venta.entity';
import { ControlDiario } from './entities/control-diario.entity';
import { InventarioModule } from '../inventario/inventario.module';

@Module({
  imports: [
    // Registramos las entidades para que el Service pueda usarlas
    TypeOrmModule.forFeature([Venta, ControlDiario]),
    InventarioModule,
  ],
  controllers: [ReportesController],
  providers: [ReportesService],
})
export class ReportesModule {}
