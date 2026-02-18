import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('CONTROL_DIARIO')
export class ControlDiario {
  @PrimaryGeneratedColumn()
  idCierre: number;

  @Column({ unique: true })
  fecha: string;

  @Column('float')
  totalVendido: number;

  @Column('float')
  totalInventario: number;

  @Column('float')
  totalPedidos: number;

  @Column('int')
  conteoVentas: number;

  @Column()
  nombreArchivo: string;

  @Column({ default: 0 })
  impreso: number; // Usamos number para compatibilidad con SQLite (0 o 1)

  @CreateDateColumn()
  fechaGeneracion: Date;
}
