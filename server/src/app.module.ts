// D:\POSINVCM\server\src\app.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventarioModule } from './inventario/inventario.module';

@Module({
  imports: [
    // Configuración de la conexión a SQLite
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'D:\\POSINVCM\\server\\src\\data\\POSINVCM.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      autoLoadEntities: true, //Carga cada entidad registrada en un module.ts por si sola, mediante TypeOrmModule.forFeature([...])
      // Mantenemos synchronize en false porque la base de datos ya existe
      synchronize: false,
      // Activamos logging para ver los errores de SQL en la terminal
      logging: true,
      dropSchema: false,
    }),
    // 2. Registro de Módulos de Negocio
    InventarioModule,
    //UsuariosModule,
    //VentaModule,
  ],
})
export class AppModule {}
