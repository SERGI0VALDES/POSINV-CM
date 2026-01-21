import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ProductoBase } from '../entities/producto-base.entity';

@Entity('TELA')
export class Tela {
  @PrimaryGeneratedColumn({ name: 'int' })
  id: number;

  @Column()
  composicion: string;

  @Column('decimal', { precision: 10, scale: 2 })
  ancho: number;

  @Column('decimal', { precision: 10, scale: 2 })
  longitudTotal: number;

  @OneToOne(() => ProductoBase)
  @JoinColumn({ name: 'idProducto', referencedColumnName: 'idProducto' })
  producto: ProductoBase;
}
