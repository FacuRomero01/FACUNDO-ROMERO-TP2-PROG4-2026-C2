import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CargandoComponent } from './cargando.component';
import { AuthService } from '../../services/auth.service';

describe('CargandoComponent', () => {
  let component: CargandoComponent;
  let fixture: ComponentFixture<CargandoComponent>;
  let mockRouter: any;
  let mockAuthService: any;

  beforeEach(async () => {
    mockRouter = {
      navigate: vi.fn(),
    };

    mockAuthService = {
      token: vi.fn(),
      autorizar: vi.fn(),
      logout: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [CargandoComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();
  });

  it('debe crearse correctamente', () => {
    mockAuthService.token.mockReturnValue(null);
    fixture = TestBed.createComponent(CargandoComponent);
    component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('debe redirigir al login si no hay token almacenado', () => {
    mockAuthService.token.mockReturnValue(null);
    fixture = TestBed.createComponent(CargandoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('debe autorizar frente a la API y redirigir a /publicaciones si el token es válido', () => {
    mockAuthService.token.mockReturnValue('jwt_valido');
    mockAuthService.autorizar.mockReturnValue(
      of({ valid: true, user: { _id: '1', nombre: 'Test' } }),
    );

    fixture = TestBed.createComponent(CargandoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(mockAuthService.autorizar).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/publicaciones']);
  });

  it('debe cerrar sesión y redirigir al login si autorizar falla', () => {
    mockAuthService.token.mockReturnValue('jwt_invalido');
    mockAuthService.autorizar.mockReturnValue(
      throwError(() => new Error('401 Unauthorized')),
    );

    fixture = TestBed.createComponent(CargandoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(mockAuthService.autorizar).toHaveBeenCalled();
    expect(mockAuthService.logout).toHaveBeenCalled();
  });
});
