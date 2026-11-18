import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { PublicacionesService } from './publicaciones.service';
import { environment } from '../../environments/environment';

describe('PublicacionesService', () => {
  let service: PublicacionesService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PublicacionesService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(PublicacionesService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('debe crearse correctamente el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('debe obtener publicaciones con parámetros de paginación y orden', () => {
    service.obtenerPublicaciones(10, 5, 'meGusta').subscribe((respuesta) => {
      expect(respuesta.total).toBe(1);
      expect(respuesta.publicaciones).toHaveLength(1);
    });

    const req = httpTesting.expectOne(
      (r) =>
        r.url === `${environment.apiUrl}/publicaciones` &&
        r.params.get('offset') === '10' &&
        r.params.get('limit') === '5' &&
        r.params.get('orden') === 'meGusta',
    );
    expect(req.request.method).toBe('GET');

    req.flush({
      publicaciones: [
        {
          _id: '1',
          titulo: 'P1',
          descripcion: 'D1',
          autor: { _id: 'u1', nombre: 'A', apellido: 'B', username: 'ab' },
          meGusta: [],
          activo: true,
          createdAt: new Date().toISOString(),
        },
      ],
      total: 1,
      offset: 10,
      limit: 5,
    });
  });

  it('debe crear una publicación mediante POST', () => {
    const formData = new FormData();
    formData.append('titulo', 'Nuevo título');
    formData.append('descripcion', 'Nueva descripción');

    service.crearPublicacion(formData).subscribe((pub) => {
      expect(pub.titulo).toBe('Nuevo título');
    });

    const req = httpTesting.expectOne(`${environment.apiUrl}/publicaciones`);
    expect(req.request.method).toBe('POST');
    req.flush({
      _id: '123',
      titulo: 'Nuevo título',
      descripcion: 'Nueva descripción',
      meGusta: [],
      activo: true,
      createdAt: new Date().toISOString(),
    });
  });

  it('debe dar de baja una publicación por DELETE', () => {
    service.eliminarPublicacion('pub-123').subscribe((res) => {
      expect(res.message).toBe('Eliminada');
    });

    const req = httpTesting.expectOne(
      `${environment.apiUrl}/publicaciones/pub-123`,
    );
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'Eliminada' });
  });

  it('debe dar me gusta a una publicación', () => {
    service.darMeGusta('pub-123').subscribe((pub) => {
      expect(pub.meGusta).toContain('user-1');
    });

    const req = httpTesting.expectOne(
      `${environment.apiUrl}/publicaciones/pub-123/me-gusta`,
    );
    expect(req.request.method).toBe('POST');
    req.flush({ _id: 'pub-123', meGusta: ['user-1'] });
  });

  it('debe quitar me gusta de una publicación', () => {
    service.quitarMeGusta('pub-123').subscribe((pub) => {
      expect(pub.meGusta).toHaveLength(0);
    });

    const req = httpTesting.expectOne(
      `${environment.apiUrl}/publicaciones/pub-123/me-gusta`,
    );
    expect(req.request.method).toBe('DELETE');
    req.flush({ _id: 'pub-123', meGusta: [] });
  });

  it('debe obtener las últimas publicaciones de un usuario', () => {
    service.obtenerUltimasPorUsuario('usr-456', 3).subscribe((pubs) => {
      expect(pubs).toHaveLength(2);
    });

    const req = httpTesting.expectOne(
      (r) =>
        r.url === `${environment.apiUrl}/publicaciones/usuario/usr-456/ultimas` &&
        r.params.get('cantidad') === '3',
    );
    expect(req.request.method).toBe('GET');
    req.flush([{}, {}]);
  });

  it('debe formatear correctamente la URL de imágenes', () => {
    expect(service.obtenerUrlImagen(null)).toBeNull();
    expect(service.obtenerUrlImagen('https://cdn.example.com/foto.jpg')).toBe(
      'https://cdn.example.com/foto.jpg',
    );
    expect(service.obtenerUrlImagen('/uploads/test.jpg')).toBe(
      `${environment.baseUrl}/uploads/test.jpg`,
    );
  });

  it('debe obtener una publicación por ID', () => {
    service.obtenerPublicacionPorId('pub-999').subscribe((pub) => {
      expect(pub._id).toBe('pub-999');
    });

    const req = httpTesting.expectOne(
      `${environment.apiUrl}/publicaciones/pub-999`,
    );
    expect(req.request.method).toBe('GET');
    req.flush({ _id: 'pub-999', titulo: 'Detalle' });
  });

  it('debe obtener comentarios paginados de una publicación', () => {
    service.obtenerComentarios('pub-999', 5, 5).subscribe((res) => {
      expect(res.total).toBe(10);
      expect(res.comentarios).toHaveLength(1);
    });

    const req = httpTesting.expectOne(
      (r) =>
        r.url === `${environment.apiUrl}/publicaciones/pub-999/comentarios` &&
        r.params.get('offset') === '5' &&
        r.params.get('limit') === '5',
    );
    expect(req.request.method).toBe('GET');
    req.flush({
      comentarios: [{ _id: 'c1', mensaje: 'Hola' }],
      total: 10,
      offset: 5,
      limit: 5,
    });
  });

  it('debe crear un comentario mediante POST', () => {
    service.crearComentario('pub-999', 'Nuevo comentario').subscribe((res) => {
      expect(res.mensaje).toBe('Nuevo comentario');
    });

    const req = httpTesting.expectOne(
      `${environment.apiUrl}/publicaciones/pub-999/comentarios`,
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ mensaje: 'Nuevo comentario' });
    req.flush({ _id: 'c1', mensaje: 'Nuevo comentario', modificado: false });
  });

  it('debe editar un comentario mediante PUT', () => {
    service
      .editarComentario('pub-999', 'c1', 'Mensaje corregido')
      .subscribe((res) => {
        expect(res.modificado).toBe(true);
        expect(res.mensaje).toBe('Mensaje corregido');
      });

    const req = httpTesting.expectOne(
      `${environment.apiUrl}/publicaciones/pub-999/comentarios/c1`,
    );
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ mensaje: 'Mensaje corregido' });
    req.flush({ _id: 'c1', mensaje: 'Mensaje corregido', modificado: true });
  });
});
