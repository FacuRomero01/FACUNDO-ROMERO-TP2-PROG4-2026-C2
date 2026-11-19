import { describe, it, expect } from 'vitest';
import { TiempoRelativoPipe } from './tiempo-relativo.pipe';

describe('TiempoRelativoPipe', () => {
  const pipe = new TiempoRelativoPipe();

  it('debe retornar string vacio para valores nulos o indefinidos', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });

  it('debe retornar "hace un momento" para fechas de hace pocos segundos', () => {
    const ahora = new Date();
    expect(pipe.transform(ahora)).toBe('hace un momento');
  });

  it('debe calcular minutos correctamente', () => {
    const hace10Min = new Date(Date.now() - 10 * 60 * 1000);
    expect(pipe.transform(hace10Min)).toBe('hace 10 minutos');
  });

  it('debe calcular horas correctamente', () => {
    const hace2Horas = new Date(Date.now() - 2 * 60 * 60 * 1000);
    expect(pipe.transform(hace2Horas)).toBe('hace 2 horas');
  });

  it('debe calcular días correctamente', () => {
    const hace3Dias = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    expect(pipe.transform(hace3Dias)).toBe('hace 3 días');
  });
});
