// src/pedidos/entities/pedido-unico.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Venta } from '../../venta/entities/venta.entity';

@Entity('PEDIDOS_UNICOS')
export class PedidoUnico {
  @PrimaryGeneratedColumn()
  idPedido: number;

  @Column({ length: 200 })
  nombreProducto: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column('decimal', { precision: 10, scale: 2 })
  precioUnitario: number;

  @Column('int')
  cantidad: number;

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal: number;

  @Column({ length: 50, default: 'pendiente' })
  estado: 'pendiente' | 'en_proceso' | 'completado' | 'entregado';

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ name: 'idVenta', nullable: true })
  idVenta: number;

  @ManyToOne(() => Venta, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'idVenta' })
  venta: Venta;

  @CreateDateColumn({ name: 'fecha_pedido' })
  fechaPedido: Date;

  @Column({ type: 'datetime', nullable: true })
  fechaEntrega: Date;

  @Column({ length: 100, nullable: true })
  clienteNombre: string;

  @Column({ length: 20, nullable: true })
  clienteTelefono: string;
}
