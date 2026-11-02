import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { MiPerfilComponent } from './mi-perfil.component';
import { PublicacionesService } from '../../services/publicaciones.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ModalService } from '../../services/modal.service';
import { User } from '../../models/user.model';

describe('MiPerfilComponent', () => {
  let component: MiPerfilComponent;
  let fixture: ComponentFixture<MiPerfilComponent>;
  let mockPublicacionesService: any;
  let mockAuthService: any;
  let mockToastService: any;
  let mockModalService: any;

  const mockUsuario: User = {
    _id: 'user-abc',
    nombre: 'Facundo',
    apellido: 'Rivas',
    email: 'facundo@test.com',
    username: 'facur',
    fechaNacimiento: '1995-05-15',
    fotoPerfil: '',
    perfil: 'usuario',
    activo: true,
  };

  beforeEach(async () => {
    mockPublicacionesService = {
      obtenerUltimasPorUsuario: vi.fn().mockReturnValue(
        of([
          {
            _id: 'pub-1',
            titulo: 'Despacho 1',
            descripcion: 'Texto 1',
            autor: mockUsuario,
            meGusta: [],
            comentarios: [],
            activo: true,
            createdAt: new Date().toISOString(),
          },
        ]),
      ),
      darMeGusta: vi.fn().mockReturnValue(of({ _id: 'pub-1', meGusta: ['u1'] })),
      quitarMeGusta: vi.fn().mockReturnValue(of({ _id: 'pub-1', meGusta: [] })),
      eliminarPublicacion: vi.fn().mockReturnValue(of({ message: 'OK' })),
      obtenerUrlImagen: vi.fn().mockReturnValue(null),
    };

    mockAuthService = {
      currentUser: vi.fn().mockReturnValue(mockUsuario),
      getAvatarUrl: vi.fn().mockReturnValue('avatar.png'),
    };

    mockToastService = {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
    };

    mockModalService = {
      confirm: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [MiPerfilComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: PublicacionesService, useValue: mockPublicacionesService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ToastService, useValue: mockToastService },
        { provide: ModalService, useValue: mockModalService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MiPerfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar las últimas 3 publicaciones del usuario autenticado', () => {
    expect(
      mockPublicacionesService.obtenerUltimasPorUsuario,
    ).toHaveBeenCalledWith('user-abc', 3);
    expect(component.ultimasPublicaciones()).toHaveLength(1);
  });

  it('debe mostrar los datos del usuario en la pantalla', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.profile-full-name')?.textContent).toContain(
      'Facundo Rivas',
    );
    expect(compiled.querySelector('.profile-username-tag')?.textContent).toContain(
      '@facur',
    );
  });

  it('debe solicitar confirmación por modal antes de eliminar una publicación', () => {
    component.solicitarBajaPublicacion('pub-1');
    expect(mockModalService.confirm).toHaveBeenCalled();
  });
});
