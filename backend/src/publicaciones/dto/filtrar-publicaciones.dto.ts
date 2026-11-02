import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class FiltrarPublicacionesDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El offset debe ser un número entero' })
  @Min(0, { message: 'El offset no puede ser menor a 0' })
  offset?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El limit debe ser un número entero' })
  @Min(1, { message: 'El limit debe ser al menos 1' })
  limit?: number = 10;

  @IsOptional()
  @IsString({ message: 'El orden debe ser una cadena de texto' })
  orden?: string = 'fecha';

  @IsOptional()
  @IsString({ message: 'El parámetro sort debe ser una cadena de texto' })
  sort?: string;

  @IsOptional()
  @IsString({ message: 'El autor debe ser un identificador válido' })
  autor?: string;

  @IsOptional()
  @IsString({ message: 'El identificador de usuario debe ser una cadena de texto' })
  usuarioId?: string;
}
