import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FiltrarComentariosDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El offset debe ser un número entero' })
  @Min(0, { message: 'El offset no puede ser menor a 0' })
  offset?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite mínimo debe ser 1' })
  limit?: number = 5;
}
