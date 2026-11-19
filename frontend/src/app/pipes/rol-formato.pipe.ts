import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'rolFormato',
  standalone: true,
})
export class RolFormatoPipe implements PipeTransform {
  transform(rol?: string | null): string {
    if (!rol) return 'DESCONOCIDO';
    const limpio = rol.toLowerCase().trim();
    if (limpio === 'administrador') {
      return 'ADMINISTRADOR';
    }
    if (limpio === 'usuario') {
      return 'USUARIO';
    }
    return rol.toUpperCase();
  }
}
