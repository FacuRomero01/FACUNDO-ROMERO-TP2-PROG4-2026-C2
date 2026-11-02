import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { PublicacionTarjetaComponent } from './publicacion-tarjeta.component';
import { Publicacion } from '../../models/publicacion.model';
import { User } from '../../models/user.model';

describe('PublicacionTarjetaComponent', () => {
  let component: PublicacionTarjetaComponent;
  let fixture: ComponentFixture<PublicacionTarjetaComponent>;

  const mockUsuario: User = {
    _id: 'user-1',
    nombre: 'Facundo',
    apellido: 'Rivas',
    email: 'facundo@test.com',
    username: 'facur',
    fechaNacimiento: '1995-05-15',
    fotoPerfil: '',
    perfil: 'usuario',
    activo: true,
  };

  const mockOtroUsuario: User = {
    _id: 'user-2',
    nombre: 'Pedro',
    apellido: 'Gomez',
    email: 'pedro@test.com',
    username: 'pedrog',
    fechaNacimiento: '1990-01-01',
    fotoPerfil: '',
    perfil: 'usuario',
    activo: true,
  };

  const mockAdmin: User = {
    _id: 'admin-1',
    nombre: 'Comandante',
    apellido: 'Admin',
    email: 'admin@test.com',
    username: 'admin',
    fechaNacimiento: '1985-01-01',
    fotoPerfil: '',
    perfil: 'administrador',
    activo: true,
  };

  const mockPublicacion: Publicacion = {
    _id: 'pub-100',
    titulo: 'Misión cumplida',
    descripcion: 'Reporte del sector de batalla',
    imagenUrl: null,
    autor: {
      _id: 'user-1',
      nombre: 'Facundo',
      apellido: 'Rivas',
      username: 'facur',
      fotoPerfil: '',
      perfil: 'usuario',
    },
    meGusta: [],
    comentarios: [
      {
        _id: 'c1',
        autor: {
          _id: 'user-2',
          nombre: 'Pedro',
          apellido: 'Gomez',
          username: 'pedrog',
        },
        mensaje: 'Excelente informe',
        modificado: false,
        createdAt: new Date().toISOString(),
      },
    ],
    activo: true,
    createdAt: new Date().toISOString(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicacionTarjetaComponent],
      providers: [provideHttpClient(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicacionTarjetaComponent);
    component = fixture.componentInstance;
    component.publicacion = { ...mockPublicacion };
    component.usuarioActual = mockUsuario;
    fixture.detectChanges();
  });

  it('debe crearse correctamente el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe mostrar el título y la descripción', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.post-title')?.textContent).toContain(
      'Misión cumplida',
    );
    expect(compiled.querySelector('.post-text')?.textContent).toContain(
      'Reporte del sector de batalla',
    );
  });

  it('debe determinar si el usuario actual dio me gusta', () => {
    expect(component.yaDioMeGusta()).toBe(false);

    component.publicacion = {
      ...component.publicacion,
      meGusta: ['user-1'],
    };
    expect(component.yaDioMeGusta()).toBe(true);
  });

  it('debe emitir alDarMeGusta si el usuario no ha dado me gusta', () => {
    const emitSpy = vi.spyOn(component.alDarMeGusta, 'emit');
    component.publicacion = { ...mockPublicacion, meGusta: [] };
    component.onToggleMeGusta();
    expect(emitSpy).toHaveBeenCalledWith('pub-100');
  });

  it('debe emitir alQuitarMeGusta si el usuario ya dio me gusta', () => {
    const emitSpy = vi.spyOn(component.alQuitarMeGusta, 'emit');
    component.publicacion = { ...mockPublicacion, meGusta: ['user-1'] };
    component.onToggleMeGusta();
    expect(emitSpy).toHaveBeenCalledWith('pub-100');
  });

  it('debe permitir eliminar al autor de la publicación', () => {
    component.usuarioActual = mockUsuario;
    expect(component.puedeEliminar()).toBe(true);
  });

  it('debe permitir eliminar a un administrador aunque no sea autor', () => {
    component.usuarioActual = mockAdmin;
    expect(component.puedeEliminar()).toBe(true);
  });

  it('no debe permitir eliminar a otro usuario que no es autor ni administrador', () => {
    component.usuarioActual = mockOtroUsuario;
    expect(component.puedeEliminar()).toBe(false);
  });

  it('debe emitir alEliminar cuando se confirma el clic en el botón de baja', () => {
    const emitSpy = vi.spyOn(component.alEliminar, 'emit');
    component.onEliminarClick();
    expect(emitSpy).toHaveBeenCalledWith('pub-100');
  });

  it('debe alternar la visualización de los comentarios al hacer toggle', () => {
    expect(component.desplegarComentarios()).toBe(false);
    component.toggleComentarios();
    expect(component.desplegarComentarios()).toBe(true);
  });
});
