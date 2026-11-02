import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CrearPublicacionDto {
  @IsNotEmpty({ message: 'El título es obligatorio' })
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @MinLength(3, { message: 'El título debe tener al menos 3 caracteres' })
  @MaxLength(120, { message: 'El título no puede superar los 120 caracteres' })
  titulo: string;

  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @MinLength(5, { message: 'La descripción debe tener al menos 5 caracteres' })
  @MaxLength(2000, { message: 'La descripción no puede superar los 2000 caracteres' })
  descripcion: string;

  @IsOptional()
  @IsString({ message: 'La URL de la imagen debe ser una cadena de texto' })
  imagenUrl?: string;
}
