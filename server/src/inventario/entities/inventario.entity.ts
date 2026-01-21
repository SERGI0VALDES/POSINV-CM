import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

// Definimos las categorías como un tipo para evitar errores de escritura
export enum TipoCategoria {
  VESTIDO = 'vestidos',
  TELA = 'telas',
  INSUMO = 'insumos',
  PRODUCTO = 'productos',
}

@Entity('inventario')
export class Inventario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({
    type: 'text',
    enum: TipoCategoria,
  })
  categoria: TipoCategoria;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  precio: number;

  @Column('int', { default: 0 })
  stock: number;

  @Column({ nullable: true })
  descripcion: string;

  @CreateDateColumn()
  createdAt: Date;
}
