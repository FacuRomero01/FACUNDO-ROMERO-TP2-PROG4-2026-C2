import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { UsuariosService } from './usuarios.service';
import { environment } from '../../environments/environment';

describe('UsuariosService', () => {
  let service: UsuariosService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UsuariosService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(UsuariosService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe solicitar el listado de usuarios por GET', () => {
    service.listarUsuarios().subscribe((usuarios) => {
      expect(usuarios).toHaveLength(1);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/usuarios`);
    expect(req.request.method).toBe('GET');
    req.flush([{ _id: '1', username: 'spy' }]);
  });

  it('debe crear un usuario enviando FormData por POST', () => {
    const formData = new FormData();
    formData.append('username', 'heavy');

    service.crearUsuario(formData).subscribe((res) => {
      expect(res.message).toBe('Creado');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/usuarios`);
    expect(req.request.method).toBe('POST');
    req.flush({ message: 'Creado', usuario: { username: 'heavy' } });
  });

  it('debe deshabilitar un usuario por DELETE', () => {
    service.deshabilitarUsuario('user123').subscribe((res) => {
      expect(res.message).toBe('Deshabilitado');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/usuarios/user123`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ message: 'Deshabilitado' });
  });

  it('debe habilitar un usuario por POST', () => {
    service.habilitarUsuario('user123').subscribe((res) => {
      expect(res.message).toBe('Habilitado');
    });

    const req = httpMock.expectOne(
      `${environment.apiUrl}/usuarios/user123/habilitar`,
    );
    expect(req.request.method).toBe('POST');
    req.flush({ message: 'Habilitado' });
  });
});
