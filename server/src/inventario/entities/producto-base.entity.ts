import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
// Recordatorio. Un Insumo hereda de un "producto-terminado"
import { Insumo } from './insumo.entity';

@Entity('PRODUCTO_BASE')
export class ProductoBase {
  @PrimaryGeneratedColumn({ name: 'int' })
  int: number;

  @Column({ unique: true, type: 'integer' }) // Asegúrate de que sea number
  idProducto: number;

  @Column()
  nombre: string;

  @Column()
  descripcion: string;

  @Column({ type: 'decimal', default: 0 })
  stockActual: number;

  @Column({ type: 'decimal', default: 0 })
  stockMinimo: number;

  @Column({ type: 'decimal' })
  precioVenta: number;

  @Column({ default: 1 })
  activo: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => Insumo, (insumo) => insumo.producto)
  insumo: Insumo;
}
