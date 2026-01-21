// pedido.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { ItemPedido } from '../entities/item-pedido.entity';

@Entity('PEDIDO')
export class Pedido {
  @PrimaryGeneratedColumn({ name: 'int' })
  id: number;

  @Column({ unique: true })
  idPedido: string; // Tu identificador de negocio (ej: PED-001)

  @Column({ default: 'Pendiente' })
  estado: string;

  @CreateDateColumn()
  fechaVenta: Date;

  @OneToMany(() => ItemPedido, (item) => item.pedido, { cascade: true })
  items: ItemPedido[];
}
