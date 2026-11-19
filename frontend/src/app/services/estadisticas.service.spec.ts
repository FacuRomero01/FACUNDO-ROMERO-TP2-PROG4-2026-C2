import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { EstadisticasService } from './estadisticas.service';
import { environment } from '../../environments/environment';

describe('EstadisticasService', () => {
  let service: EstadisticasService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EstadisticasService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(EstadisticasService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe obtener el resumen de estadísticas', () => {
    service.obtenerResumen({ desde: '2026-01-01' }).subscribe((res) => {
      expect(res.totales.totalPublicaciones).toBe(10);
    });

    const req = httpMock.expectOne(
      (r) =>
        r.url === `${environment.apiUrl}/estadisticas/resumen` &&
        r.params.get('desde') === '2026-01-01',
    );
    expect(req.request.method).toBe('GET');
    req.flush({
      publicacionesPorUsuario: [],
      comentariosPorTiempo: [],
      totalComentarios: 5,
      comentariosPorPublicacion: [],
      totales: { totalPublicaciones: 10, totalComentarios: 5 },
    });
  });

  it('debe obtener publicaciones por usuario', () => {
    service.obtenerPublicacionesPorUsuario().subscribe((res) => {
      expect(res).toHaveLength(1);
    });

    const req = httpMock.expectOne(
      `${environment.apiUrl}/estadisticas/publicaciones-por-usuario`,
    );
    expect(req.request.method).toBe('GET');
    req.flush([{ usuarioId: 'u1', username: 'pyro', cantidad: 4 }]);
  });
});
