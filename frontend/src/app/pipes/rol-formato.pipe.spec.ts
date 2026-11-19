import { describe, it, expect } from 'vitest';
import { RolFormatoPipe } from './rol-formato.pipe';

describe('RolFormatoPipe', () => {
  const pipe = new RolFormatoPipe();

  it('debe manejar valores nulos', () => {
    expect(pipe.transform(null)).toBe('DESCONOCIDO');
  });

  it('debe formatear rol de administrador', () => {
    expect(pipe.transform('administrador')).toBe('ADMINISTRADOR');
  });

  it('debe formatear rol de usuario', () => {
    expect(pipe.transform('usuario')).toBe('USUARIO');
  });
});
