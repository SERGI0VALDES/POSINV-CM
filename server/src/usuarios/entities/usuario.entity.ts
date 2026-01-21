import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('USUARIO')
export class Usuario {
  @PrimaryGeneratedColumn({ name: 'int' })
  id: number;

  @Column({ unique: true })
  nombreUsuario: string;

  @Column({ select: false }) // Importante: No se incluye en consultas normales
  hashPassword: string;

  @Column({ default: 'usuario' })
  rol: string;

  @Column({ default: 1 })
  activo: number;
}
