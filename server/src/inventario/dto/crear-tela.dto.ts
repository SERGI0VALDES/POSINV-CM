import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CrearTelaDto {
  @IsString()
  nombreTela: string;

  @IsNumber()
  ancho: number;

  @IsNumber()
  largoTotal: number;

  @IsNumber()
  stockRollo: number;

  @IsString()
  color: string;

  @IsString()
  @IsOptional()
  proveedor?: string;

  @IsNumber()
  minimoStock: number;
}
