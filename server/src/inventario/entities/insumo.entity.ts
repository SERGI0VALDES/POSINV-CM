import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('INSUMO')
export class Insumo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  categoria: string; // hilos, agujas, cierres, etc.

  @Column()
  nombre: string;

  @Column()
  unidadMedida: string;

  @Column('decimal', { precision: 10, scale: 2 })
  cantidadUnidad: number;

  @Column('int')
  stockActual: number;

  @Column('int')
  stockMinimo: number;

  // Campos condicionales (según categoría)
  @Column({ nullable: true })
  tipoHilo: string;

  @Column({ nullable: true })
  tipoAguja: string;

  @Column({ nullable: true })
  tipoCierre: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  medidaCierre: number;

  @Column({ nullable: true })
  tipoBroche: string;

  @Column({ nullable: true })
  tipoAdorno: string;

  @Column({ nullable: true })
  tipoEspecial: string;

  @Column({ nullable: true })
  colorHilo: string;

  @Column({ nullable: true })
  colorCierre: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
