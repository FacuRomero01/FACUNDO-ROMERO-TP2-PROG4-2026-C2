import { describe, it, expect, beforeEach } from 'vitest';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AdminGuard } from './admin.guard.js';

describe('AdminGuard', () => {
  let guard: AdminGuard;

  beforeEach(() => {
    guard = new AdminGuard();
  });

  const crearContexto = (user: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    } as any;
  };

  it('debe permitir acceso si el usuario es administrador', () => {
    const contexto = crearContexto({ perfil: 'administrador' });
    expect(guard.canActivate(contexto)).toBe(true);
  });

  it('debe denegar acceso con ForbiddenException si el usuario no es administrador', () => {
    const contexto = crearContexto({ perfil: 'usuario' });
    expect(() => guard.canActivate(contexto)).toThrow(ForbiddenException);
  });

  it('debe denegar acceso si no existe usuario en la request', () => {
    const contexto = crearContexto(null);
    expect(() => guard.canActivate(contexto)).toThrow(ForbiddenException);
  });
});
