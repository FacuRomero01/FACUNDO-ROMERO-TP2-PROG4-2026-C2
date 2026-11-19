import { describe, it, expect, beforeEach, vi } from 'vitest';
import { adminGuard } from './admin.guard';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { ToastService } from '../services/toast.service';
import { TestBed } from '@angular/core/testing';

describe('adminGuard', () => {
  let mockAuthService: any;
  let mockRouter: any;
  let mockToastService: any;

  beforeEach(() => {
    mockAuthService = {
      isAuthenticated: vi.fn(),
      isAdmin: vi.fn(),
    };
    mockRouter = {
      navigate: vi.fn(),
    };
    mockToastService = {
      error: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: ToastService, useValue: mockToastService },
      ],
    });
  });

  it('debe permitir acceso si el usuario está autenticado y es administrador', () => {
    mockAuthService.isAuthenticated.mockReturnValue(true);
    mockAuthService.isAdmin.mockReturnValue(true);

    const resultado = TestBed.runInInjectionContext(() =>
      adminGuard({} as any, { url: '/dashboard/usuarios' } as any),
    );

    expect(resultado).toBe(true);
  });

  it('debe redirigir al login si no está autenticado', () => {
    mockAuthService.isAuthenticated.mockReturnValue(false);

    const resultado = TestBed.runInInjectionContext(() =>
      adminGuard({} as any, { url: '/dashboard/usuarios' } as any),
    );

    expect(resultado).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/dashboard/usuarios' },
    });
  });

  it('debe mostrar error y redirigir a publicaciones si es usuario común', () => {
    mockAuthService.isAuthenticated.mockReturnValue(true);
    mockAuthService.isAdmin.mockReturnValue(false);

    const resultado = TestBed.runInInjectionContext(() =>
      adminGuard({} as any, { url: '/dashboard/usuarios' } as any),
    );

    expect(resultado).toBe(false);
    expect(mockToastService.error).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/publicaciones']);
  });
});
