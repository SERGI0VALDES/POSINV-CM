import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ProductoBase } from '../../inventario/entities/producto-base.entity';

@Entity('VENTA')
export class Venta {
  @PrimaryGeneratedColumn()
  idVenta: number;

  @CreateDateColumn({ type: 'datetime' })
  fecha: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'varchar', length: 50, default: 'completada' })
  estado: string; // 'completada', 'cancelada'

  // Una venta tiene muchos detalles (productos)
  @OneToMany(() => DetalleVenta, (detalle) => detalle.venta, { cascade: true })
  detalles: DetalleVenta[];
}

@Entity('DETALLE_VENTA')
export class DetalleVenta {
  @PrimaryGeneratedColumn()
  idDetalle: number;

  @Column({ type: 'int' })
  idVenta: number;

  @Column({ type: 'int' })
  idProducto: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precioUnitario: number; // Guardamos el precio del momento de la venta

  @Column({ type: 'int' })
  cantidad: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  // Relación con la Venta
  @ManyToOne(() => Venta, (venta) => venta.detalles)
  @JoinColumn({ name: 'idVenta' })
  venta: Venta;

  // Relación con el Producto (para saber qué se vendió)
  @ManyToOne(() => ProductoBase)
  @JoinColumn({ name: 'idProducto' })
  producto: ProductoBase;
}
