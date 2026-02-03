import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ProductoBase } from '../entities/producto-base.entity';

@Entity('PROD_TERMINADO')
export class ProductoTerminado {
  @PrimaryGeneratedColumn({ name: 'int' })
  id: number;

  @Column({ name: 'idProducto', unique: true })
  idProducto: number;

  @Column({ name: 'codigoSku', unique: true })
  codigoSku: string;

  @Column({ name: 'categoria', type: 'varchar', length: 50, nullable: true })
  categoria: string;

  @Column({ name: 'color' })
  color: string;

  @OneToOne(() => ProductoBase, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idProducto' })
  producto: ProductoBase;
}
