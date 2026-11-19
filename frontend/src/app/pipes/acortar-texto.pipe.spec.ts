import { describe, it, expect } from 'vitest';
import { AcortarTextoPipe, AcortarTextoMinuscPipe } from './acortar-texto.pipe';

describe('AcortarTextoPipe', () => {
  const pipe = new AcortarTextoPipe();
  const pipeMinusc = new AcortarTextoMinuscPipe();

  it('debe devolver cadena vacía si el valor es nulo o indefinido', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });

  it('debe devolver el texto completo si no supera la longitud maxima', () => {
    expect(pipe.transform('Hola mundo', 20)).toBe('Hola mundo');
  });

  it('debe recortar el texto y agregar puntos suspensivos', () => {
    expect(pipe.transform('Este es un reporte muy largo de inteligencia', 10)).toBe(
      'Este es un...',
    );
  });

  it('debe permitir longitud maxima como string', () => {
    expect(pipe.transform('Reporte confidencial', '7')).toBe('Reporte...');
  });

  it('debe permitir elipsis personalizado', () => {
    expect(pipe.transform('Texto largo para recortar', 5, ' [leer más]')).toBe(
      'Texto [leer más]',
    );
  });

  it('debe funcionar igualmente a través del alias en minúsculas', () => {
    expect(pipeMinusc.transform('Texto largo para recortar', 5)).toBe('Texto...');
  });
});
