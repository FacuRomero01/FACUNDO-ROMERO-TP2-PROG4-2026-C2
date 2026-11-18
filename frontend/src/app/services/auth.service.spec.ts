import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ModalService } from './modal.service';
import { ToastService } from './toast.service';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;
  let mockRouter: any;
  let mockModalService: any;
  let mockToastService: any;

  beforeEach(() => {
    mockRouter = {
      navigate: vi.fn(),
    };
    mockModalService = {
      confirm: vi.fn(),
      close: vi.fn(),
    };
    mockToastService = {
      success: vi.fn(),
      warning: vi.fn(),
      error: vi.fn(),
    };

    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: mockRouter },
        { provide: ModalService, useValue: mockModalService },
        { provide: ToastService, useValue: mockToastService },
      ],
    });

    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  it('debe crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('debe validar la sesión mediante autorizar()', () => {
    const mockUser: any = {
      _id: 'u1',
      nombre: 'Soldier',
      apellido: 'TF2',
      email: 'soldier@mannco.com',
      username: 'soldier',
      fechaNacimiento: '1990-01-01',
      fotoPerfil: '/uploads/avatars/soldier.png',
      perfil: 'usuario',
      activo: true,
    };

    service.autorizar().subscribe((res) => {
      expect(res.valid).toBe(true);
      expect(service.currentUser()?.username).toBe('soldier');
    });

    const req = httpTesting.expectOne(`${environment.apiUrl}/auth/autorizar`);
    expect(req.request.method).toBe('POST');
    req.flush({ valid: true, user: mockUser });
  });

  it('debe renovar el token mediante refrescar()', () => {
    const mockUser: any = {
      _id: 'u1',
      nombre: 'Soldier',
      apellido: 'TF2',
      email: 'soldier@mannco.com',
      username: 'soldier',
      fechaNacimiento: '1990-01-01',
      fotoPerfil: '/uploads/avatars/soldier.png',
      perfil: 'usuario',
      activo: true,
    };

    service.refrescar().subscribe((res) => {
      expect(res.token).toBe('nuevo_token_refrescado');
      expect(service.token()).toBe('nuevo_token_refrescado');
    });

    const req = httpTesting.expectOne(`${environment.apiUrl}/auth/refrescar`);
    expect(req.request.method).toBe('POST');
    req.flush({
      message: 'Token refrescado exitosamente',
      token: 'nuevo_token_refrescado',
      user: mockUser,
    });
  });

  it('debe limpiar almacenamiento y redirigir al login en logout()', () => {
    service.setSession('test_token', {
      _id: '1',
      nombre: 'N',
      apellido: 'A',
      email: 'e@e.com',
      username: 'u',
      fechaNacimiento: '1990-01-01',
      fotoPerfil: '/avatar.png',
      perfil: 'usuario',
      activo: true,
    });

    expect(service.isAuthenticated()).toBe(true);

    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(service.token()).toBeNull();
    expect(service.currentUser()).toBeNull();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });
});
