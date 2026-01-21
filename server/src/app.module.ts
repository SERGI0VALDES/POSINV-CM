import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventarioModule } from './inventario/inventario.module';
import { Inventario } from './inventario/entities/inventario.entity';

@Module({
  imports: [
    // Configuración de la conexión a SQLite
    TypeOrmModule.forRoot({
      type: 'sqlite',
      // Aquí usamos la ruta a tu base de datos actual.
      // Si quieres que cree una nueva, deja 'database.sqlite'
      database: 'D:\\POSINVCM\\server\\src\\data\\POSINVCM.db',
      entities: [Inventario],
      synchronize: false,
      // synchronize: true crea las tablas automáticamente al iniciar (ideal para desarrollo)
      logging: true,
    }),
    InventarioModule,
  ],
})
export class AppModule {}
