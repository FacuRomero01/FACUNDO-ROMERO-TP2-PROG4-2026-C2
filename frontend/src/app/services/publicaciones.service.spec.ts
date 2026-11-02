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
});
