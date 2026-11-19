import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'acortarTexto',
  standalone: true,
})
export class AcortarTextoPipe implements PipeTransform {
  transform(
    valor?: unknown,
    longitudMaxima: number | string = 30,
    elipsis: string = '...',
  ): string {
    if (valor === null || valor === undefined) return '';
    const texto = String(valor);
    const limite = Number(longitudMaxima) > 0 ? Number(longitudMaxima) : 30;

    if (texto.length <= limite) return texto;
    return texto.slice(0, limite).trimEnd() + elipsis;
  }
}

/**
 * Alias de la pipe en minúsculas para compatibilidad de uso en plantillas.
 */
@Pipe({
  name: 'acortartexto',
  standalone: true,
})
export class AcortarTextoMinuscPipe extends AcortarTextoPipe {}
