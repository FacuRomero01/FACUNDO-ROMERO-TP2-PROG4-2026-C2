import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  OrdenPublicaciones,
  Publicacion,
  RespuestaPublicaciones,
} from '../models/publicacion.model';

@Injectable({
  providedIn: 'root',
})
export class PublicacionesService {
  private readonly http = inject(HttpClient);

  obtenerPublicaciones(
    offset = 0,
    limit = 10,
    orden: OrdenPublicaciones = 'fecha',
    usuarioId?: string,
  ): Observable<RespuestaPublicaciones> {
    let params = new HttpParams()
      .set('offset', offset.toString())
      .set('limit', limit.toString())
      .set('orden', orden);

    if (usuarioId) {
      params = params.set('usuarioId', usuarioId);
    }

    return this.http.get<RespuestaPublicaciones>(
      `${environment.apiUrl}/publicaciones`,
      { params },
    );
  }

  crearPublicacion(formulario: FormData): Observable<Publicacion> {
    return this.http.post<Publicacion>(
      `${environment.apiUrl}/publicaciones`,
      formulario,
    );
  }

  eliminarPublicacion(publicacionId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${environment.apiUrl}/publicaciones/${publicacionId}`,
    );
  }

  darMeGusta(publicacionId: string): Observable<Publicacion> {
    return this.http.post<Publicacion>(
      `${environment.apiUrl}/publicaciones/${publicacionId}/me-gusta`,
      {},
    );
  }

  quitarMeGusta(publicacionId: string): Observable<Publicacion> {
    return this.http.delete<Publicacion>(
      `${environment.apiUrl}/publicaciones/${publicacionId}/me-gusta`,
    );
  }

  obtenerUltimasPorUsuario(
    usuarioId: string,
    cantidad = 3,
  ): Observable<Publicacion[]> {
    return this.http.get<Publicacion[]>(
      `${environment.apiUrl}/publicaciones/usuario/${usuarioId}/ultimas`,
      {
        params: new HttpParams().set('cantidad', cantidad.toString()),
      },
    );
  }

  obtenerUrlImagen(imagenUrl?: string | null): string | null {
    if (!imagenUrl) {
      return null;
    }
    if (imagenUrl.startsWith('http://') || imagenUrl.startsWith('https://')) {
      return imagenUrl;
    }
    return `${environment.baseUrl}${imagenUrl}`;
  }
}
