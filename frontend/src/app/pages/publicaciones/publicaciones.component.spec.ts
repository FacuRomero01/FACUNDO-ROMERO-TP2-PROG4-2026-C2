import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { PublicacionesComponent } from './publicaciones.component';
import { PublicacionesService } from '../../services/publicaciones.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ModalService } from '../../services/modal.service';

describe('PublicacionesComponent', () => {
  let component: PublicacionesComponent;
  let fixture: ComponentFixture<PublicacionesComponent>;
  let mockPublicacionesService: any;
  let mockToastService: any;
  let mockModalService: any;

  beforeEach(async () => {
    mockPublicacionesService = {
      obtenerPublicaciones: vi.fn().mockReturnValue(
        of({
          publicaciones: [
            {
              _id: 'pub-1',
              titulo: 'Título 1',
              descripcion: 'Desc 1',
              autor: { _id: 'u1', nombre: 'A', apellido: 'B', username: 'ab' },
              meGusta: [],
              comentarios: [],
              activo: true,
              createdAt: new Date().toISOString(),
            },
          ],
          total: 1,
          offset: 0,
          limit: 5,
        }),
      ),
      crearPublicacion: vi.fn().mockReturnValue(
        of({
          _id: 'pub-2',
          titulo: 'Título 2',
          descripcion: 'Desc 2',
          meGusta: [],
          activo: true,
          createdAt: new Date().toISOString(),
        }),
      ),
      darMeGusta: vi.fn().mockReturnValue(of({ _id: 'pub-1', meGusta: ['u1'] })),
      quitarMeGusta: vi.fn().mockReturnValue(of({ _id: 'pub-1', meGusta: [] })),
      eliminarPublicacion: vi.fn().mockReturnValue(of({ message: 'OK' })),
      obtenerUrlImagen: vi.fn().mockReturnValue(null),
    };

    mockToastService = {
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
      info: vi.fn(),
    };

    mockModalService = {
      confirm: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [PublicacionesComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: PublicacionesService, useValue: mockPublicacionesService },
        { provide: ToastService, useValue: mockToastService },
        { provide: ModalService, useValue: mockModalService },
        AuthService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar las publicaciones al iniciar', () => {
    expect(mockPublicacionesService.obtenerPublicaciones).toHaveBeenCalled();
    expect(component.publicaciones()).toHaveLength(1);
    expect(component.totalRegistros()).toBe(1);
  });

  it('debe cambiar de ordenamiento y reiniciar a la página 1', () => {
    component.paginaActual.set(3);
    component.cambiarOrden('meGusta');
    expect(component.ordenActual()).toBe('meGusta');
    expect(component.paginaActual()).toBe(1);
    expect(mockPublicacionesService.obtenerPublicaciones).toHaveBeenCalled();
  });

  it('debe cambiar de página dentro de los rangos válidos', () => {
    component.totalRegistros.set(20);
    component.cambiarPagina(2);
    expect(component.paginaActual()).toBe(2);
  });

  it('no debe enviar el formulario si es inválido', () => {
    component.formularioPublicacion.reset();
    component.enviarPublicacion();
    expect(mockToastService.warning).toHaveBeenCalled();
    expect(mockPublicacionesService.crearPublicacion).not.toHaveBeenCalled();
  });

  it('debe enviar la publicación si el formulario es válido', () => {
    component.formularioPublicacion.patchValue({
      titulo: 'Título válido',
      descripcion: 'Descripción con suficiente longitud para pasar validación',
    });
    component.enviarPublicacion();
    expect(mockPublicacionesService.crearPublicacion).toHaveBeenCalled();
    expect(mockToastService.success).toHaveBeenCalled();
  });

  it('debe solicitar confirmación por modal antes de eliminar una publicación', () => {
    component.solicitarBajaPublicacion('pub-1');
    expect(mockModalService.confirm).toHaveBeenCalled();
  });
});
