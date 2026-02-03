import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ProductoBase } from './producto-base.entity'; // Asegúrate de que la ruta sea correcta

@Entity('VESTIDO')
export class Vestido {
  @PrimaryGeneratedColumn({ name: 'int' })
  int: number; // ID único del registro en esta tabla

  @Column({ name: 'idProducto', unique: true })
  idProducto: number; // El ID que viene de PRODUCTO_BASE (El vínculo directo al ID del padre)

  @Column({ name: 'color' })
  color: string;

  @Column({ name: 'codigoSku', unique: true })
  codigoSku: string;

  @Column({ name: 'categoria', nullable: true }) // Agregado para que coincida con tu Front
  categoria: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  // Relación 1:1 mejor definida
  @OneToOne(() => ProductoBase, {
    onDelete: 'CASCADE', // Si borras el producto, se borra el vestido solo. ¡Flama!
    eager: false, // No trae los datos del producto a menos que lo pidas explícitamente
  })
  @JoinColumn({ name: 'idProducto' })
  producto: ProductoBase;
}
