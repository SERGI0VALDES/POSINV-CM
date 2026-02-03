import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

@Entity('TELA')
export class Tela {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'nombre' })
  nombreTela: string;

  @Column('decimal', { precision: 10, scale: 2 })
  ancho: number;

  @Column('decimal', { precision: 10, scale: 2 })
  largoTotal: number;

  @Column({ name: 'stockRollo' })
  stockRollo: number;

  @Column({ name: 'minimoStock' })
  minimoStock: number;

  @Column({ name: 'color' })
  color: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
