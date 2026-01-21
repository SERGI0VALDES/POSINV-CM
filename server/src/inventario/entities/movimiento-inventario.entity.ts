// entities/movimiento-inventario.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProductoBase } from './producto-base.entity';
// Importa la entidad Usuario si ya la tienes creada

@Entity('MOV_INVENTARIO')
export class MovimientoInventario {
  @PrimaryGeneratedColumn({ name: 'int' })
  id: number;

  @Column({ unique: true })
  idMovimiento: string;

  @Column({ type: 'varchar' })
  tipoMovimiento: 'entrada' | 'salida' | 'ajuste';

  @Column({ type: 'real' })
  cantidad: number;

  @Column({ nullable: true })
  origen: string;

  @Column({ nullable: true })
  observaciones: string;

  @CreateDateColumn()
  fechaMovimiento: Date;

  @ManyToOne(() => ProductoBase)
  @JoinColumn({ name: 'idProducto', referencedColumnName: 'idProducto' })
  producto: ProductoBase;

  @Column()
  idUsuario: number; // Podrías relacionarlo con una entidad Usuario después
}
