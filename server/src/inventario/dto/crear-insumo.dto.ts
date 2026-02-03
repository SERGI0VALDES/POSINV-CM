import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  Min,
} from 'class-validator';

export class CrearInsumoDto {
  @IsString()
  @IsNotEmpty()
  categoria: string;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  unidadMedida: string;

  @IsNumber()
  @Min(0.01)
  cantidadUnidad: number;

  @IsNumber()
  @Min(0)
  stockActual: number;

  @IsNumber()
  @Min(0)
  stockMinimo: number;

  // Campos dinámicos opcionales
  @IsString()
  @IsOptional()
  tipoHilo?: string;

  @IsString()
  @IsOptional()
  tipoAguja?: string;

  @IsString()
  @IsOptional()
  tipoCierre?: string;

  @IsNumber()
  @IsOptional()
  medidaCierre?: number;

  @IsString()
  @IsOptional()
  tipoBroche?: string;

  @IsString()
  @IsOptional()
  tipoAdorno?: string;

  @IsString()
  @IsOptional()
  tipoEspecial?: string;

  @IsString()
  @IsOptional()
  colorHilo?: string;

  @IsString()
  @IsOptional()
  colorCierre?: string;
}
