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

  @Column({ unique: true })
  codigoSku: string;

  @Column()
  tipoProducto: string; // Ej: Vestido, Pantalón

  @OneToOne(() => ProductoBase)
  @JoinColumn({ name: 'idProducto', referencedColumnName: 'idProducto' })
  producto: ProductoBase;
}
