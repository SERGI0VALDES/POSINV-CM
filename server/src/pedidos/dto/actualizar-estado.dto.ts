import { IsString, IsOptional, IsIn } from 'class-validator';

export class ActualizarEstadoDto {
  @IsString()
  @IsIn(['pendiente', 'en_proceso', 'completado', 'entregado'], {
    message:
      'El estado debe ser: pendiente, en_proceso, completado o entregado',
  })
  estado: 'pendiente' | 'en_proceso' | 'completado' | 'entregado';

  @IsString()
  @IsOptional()
  observaciones?: string;
}
