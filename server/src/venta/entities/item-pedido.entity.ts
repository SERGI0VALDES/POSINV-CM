// item-pedido.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Pedido } from './pedido.entity';
import { ProductoBase } from '../../inventario/entities/producto-base.entity';

@Entity('ITEM_PEDIDO')
export class ItemPedido {
  @PrimaryGeneratedColumn({ name: 'int' })
  id: number;

  @Column('real')
  cantidad: number;

  @Column('real')
  precioUnitario: number;

  @Column('real')
  subtotal: number;

  @ManyToOne(() => Pedido, (pedido) => pedido.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'idUltimoPedido' })
  pedido: Pedido;

  @ManyToOne(() => ProductoBase)
  @JoinColumn({ name: 'idProducto', referencedColumnName: 'idProducto' })
  producto: ProductoBase;
}
