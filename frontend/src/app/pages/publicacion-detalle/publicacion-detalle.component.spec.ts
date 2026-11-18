import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { PublicacionDetalleComponent } from './publicacion-detalle.component';
import { PublicacionesService } from '../../services/publicaciones.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ModalService } from '../../services/modal.service';

describe('PublicacionDetalleComponent', () => {
  let component: PublicacionDetalleComponent;
  let fixture: ComponentFixture<PublicacionDetalleComponent>;
  let mockPublicacionesService: any;
  let mockAuthService: any;
  let mockToastService: any;
  let mockModalService: any;

  const mockUsuario = {
    _id: 'user1',
    nombre: 'Scout',
    apellido: 'TF2',
    username: 'scout',
    perfil: 'usuario',
  };

  const mockPublicacion = {
    _id: 'pub123',
    titulo: 'Informe de Batalla',
    descripcion: 'Reporte confidencial',
    autor: mockUsuario,
    meGusta: ['user1'],
    comentarios: [
      {
        _id: 'com1',
        autor: mockUsuario,
        mensaje: 'Comentario de prueba inicial',
        modificado: false,
        createdAt: '2026-03-01T12:00:00Z',
      },
    ],
    activo: true,
    createdAt: '2026-03-01T10:00:00Z',
  };

  beforeEach(async () => {
    mockPublicacionesService = {
      obtenerPublicacionPorId: vi.fn().mockReturnValue(of(mockPublicacion)),
      obtenerComentarios: vi.fn().mockReturnValue(
        of({
          comentarios: mockPublicacion.comentarios,
          total: 2,
          offset: 0,
          limit: 1,
        }),
      ),
      crearComentario: vi.fn(),
      editarComentario: vi.fn(),
      darMeGusta: vi.fn(),
      quitarMeGusta: vi.fn(),
      eliminarPublicacion: vi.fn(),
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
      imports: [PublicacionDetalleComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'id' ? 'pub123' : null),
              },
            },
          },
        },
        { provide: PublicacionesService, useValue: mockPublicacionesService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ToastService, useValue: mockToastService },
        { provide: ModalService, useValue: mockModalService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicacionDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse y cargar el detalle de la publicación junto con los comentarios iniciales', () => {
    expect(component).toBeTruthy();
    expect(
      mockPublicacionesService.obtenerPublicacionPorId,
    ).toHaveBeenCalledWith('pub123');
    expect(mockPublicacionesService.obtenerComentarios).toHaveBeenCalledWith(
      'pub123',
      0,
      5,
    );
    expect(component.publicacion()?.titulo).toBe('Informe de Batalla');
    expect(component.comentarios()).toHaveLength(1);
    expect(component.totalComentarios()).toBe(2);
  });

  it('debe permitir cargar más comentarios sin perder los anteriores', () => {
    const nuevoComentario = {
      _id: 'com2',
      autor: mockUsuario,
      mensaje: 'Segundo comentario cargado',
      modificado: false,
      createdAt: '2026-03-01T11:00:00Z',
    };

    mockPublicacionesService.obtenerComentarios.mockReturnValue(
      of({
        comentarios: [nuevoComentario],
        total: 2,
        offset: 1,
        limit: 5,
      }),
    );

    component.cargarMasComentarios();

    expect(component.comentarios()).toHaveLength(2);
    expect(component.comentarios()[1].mensaje).toBe(
      'Segundo comentario cargado',
    );
  });

  it('debe enviar un nuevo comentario y agregarlo al inicio de la lista', () => {
    const comentarioCreado = {
      _id: 'com_nuevo',
      autor: mockUsuario,
      mensaje: 'Nuevo reporte táctico',
      modificado: false,
      createdAt: '2026-03-01T13:00:00Z',
    };

    mockPublicacionesService.crearComentario.mockReturnValue(
      of(comentarioCreado),
    );

    component.formularioComentario.patchValue({
      mensaje: 'Nuevo reporte táctico',
    });
    component.enviarComentario();

    expect(mockPublicacionesService.crearComentario).toHaveBeenCalledWith(
      'pub123',
      'Nuevo reporte táctico',
    );
    expect(component.comentarios()[0].mensaje).toBe('Nuevo reporte táctico');
    expect(mockToastService.success).toHaveBeenCalled();
  });

  it('debe editar un comentario y actualizar su estado a modificado', () => {
    const comentarioAEditar = component.comentarios()[0];
    component.iniciarEdicion(comentarioAEditar);

    expect(component.comentarioEnEdicionId()).toBe('com1');
    expect(component.textoEdicion()).toBe('Comentario de prueba inicial');

    component.textoEdicion.set('Texto corregido y actualizado');

    mockPublicacionesService.editarComentario.mockReturnValue(
      of({
        ...comentarioAEditar,
        mensaje: 'Texto corregido y actualizado',
        modificado: true,
      }),
    );

    component.guardarEdicion(comentarioAEditar);

    expect(mockPublicacionesService.editarComentario).toHaveBeenCalledWith(
      'pub123',
      'com1',
      'Texto corregido y actualizado',
    );
    expect(component.comentarios()[0].mensaje).toBe(
      'Texto corregido y actualizado',
    );
    expect(component.comentarios()[0].modificado).toBe(true);
    expect(component.comentarioEnEdicionId()).toBeNull();
  });

  it('debe alternar me gusta de la publicación', () => {
    mockPublicacionesService.quitarMeGusta.mockReturnValue(
      of({
        ...mockPublicacion,
        meGusta: [],
      }),
    );

    expect(component.yaDioMeGusta()).toBe(true);
    component.toggleMeGusta();

    expect(mockPublicacionesService.quitarMeGusta).toHaveBeenCalledWith('pub123');
    expect(component.publicacion()?.meGusta).toHaveLength(0);
  });
});
