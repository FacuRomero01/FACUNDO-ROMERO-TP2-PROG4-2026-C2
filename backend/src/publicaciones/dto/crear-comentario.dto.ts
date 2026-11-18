import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CrearComentarioDto {
  @IsNotEmpty({ message: 'El comentario no puede estar vacío' })
  @IsString({ message: 'El comentario debe ser una cadena de texto' })
  @MaxLength(1000, {
    message: 'El comentario no puede superar los 1000 caracteres',
  })
  mensaje: string;
}
