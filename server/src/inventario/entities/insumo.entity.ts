import {
  Column,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { ProductoBase } from './producto-base.entity';

@Entity('INSUMO')
export class Insumo {
  @PrimaryGeneratedColumn({ name: 'int' })
  id: number;

  @Column()
  nombreInsumo: string;

  @Column({ default: 'unidad' })
  unidadMedida: string;

  @Column({ type: 'decimal', nullable: true })
  ancho: number;

  @Column({ type: 'decimal', nullable: true })
  longitudTotal: number;

  @OneToOne(() => ProductoBase, (producto) => producto.insumo)
  @JoinColumn({ name: 'idProducto' })
  producto: ProductoBase;
}
