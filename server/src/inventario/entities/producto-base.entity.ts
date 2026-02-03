import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ViewEntity,
  ViewColumn,
} from 'typeorm';

@Entity('PRODUCTO_BASE')
export class ProductoBase {
  @PrimaryGeneratedColumn() // Este será 1, 2, 3... y será el ID de negocio también
  idProducto: number;

  @Column({ type: 'varchar', length: 100, nullable: false }) // nullable: false es el NOT NULL
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
}

@ViewEntity({
  name: 'v_productos_completos',
  expression: `SELECT * FROM v_productos_completos`,
  synchronize: false,
})
export class ProductoCompleto {
  @ViewColumn() idProducto: number;
  @ViewColumn() nombre: string;
  @ViewColumn() descripcion: string;
  @ViewColumn() stockActual: number;
  @ViewColumn() stockMinimo: number;
  @ViewColumn() precioVenta: number;
  @ViewColumn() activo: number;

  // Campos de VESTIDO
  @ViewColumn() color: string;
  @ViewColumn() skuVestido: string;
  @ViewColumn() categoria: string;

  // Campos de PROD_TERMINADO
  @ViewColumn() skuProductoTerminado: string;
}
