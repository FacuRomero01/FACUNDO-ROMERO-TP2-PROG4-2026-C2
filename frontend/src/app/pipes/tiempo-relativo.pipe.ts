import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tiempoRelativo',
  standalone: true,
})
export class TiempoRelativoPipe implements PipeTransform {
  transform(valor?: string | Date | null): string {
    if (!valor) return '';

    const fecha = new Date(valor);
    if (isNaN(fecha.getTime())) return String(valor);

    const ahora = Date.now();
    const diferenciaSegundos = Math.floor((ahora - fecha.getTime()) / 1000);

    if (diferenciaSegundos < 60) {
      return 'hace un momento';
    }

    const minutos = Math.floor(diferenciaSegundos / 60);
    if (minutos < 60) {
      return `hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`;
    }

    const horas = Math.floor(minutos / 60);
    if (horas < 24) {
      return `hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`;
    }

    const dias = Math.floor(horas / 24);
    if (dias < 30) {
      return `hace ${dias} ${dias === 1 ? 'día' : 'días'}`;
    }

    const meses = Math.floor(dias / 30);
    if (meses < 12) {
      return `hace ${meses} ${meses === 1 ? 'mes' : 'meses'}`;
    }

    const anios = Math.floor(meses / 12);
    return `hace ${anios} ${anios === 1 ? 'año' : 'años'}`;
  }
}
