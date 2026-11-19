import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ComentarioPorPublicacionEstadistica,
  ComentarioPorTiempoEstadistica,
  FiltroEstadisticas,
  PublicacionPorUsuarioEstadistica,
  ResumenEstadisticas,
} from '../models/estadisticas.model';

@Injectable({
  providedIn: 'root',
})
export class EstadisticasService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/estadisticas`;

  private construirParams(filtro?: FiltroEstadisticas): HttpParams {
    let params = new HttpParams();
    if (filtro?.desde) {
      params = params.set('desde', filtro.desde);
    }
    if (filtro?.hasta) {
      params = params.set('hasta', filtro.hasta);
    }
    return params;
  }

  obtenerResumen(filtro?: FiltroEstadisticas): Observable<ResumenEstadisticas> {
    const params = this.construirParams(filtro);
    return this.http.get<ResumenEstadisticas>(`${this.apiUrl}/resumen`, {
      params,
    });
  }

  obtenerPublicacionesPorUsuario(
    filtro?: FiltroEstadisticas,
  ): Observable<PublicacionPorUsuarioEstadistica[]> {
    const params = this.construirParams(filtro);
    return this.http.get<PublicacionPorUsuarioEstadistica[]>(
      `${this.apiUrl}/publicaciones-por-usuario`,
      { params },
    );
  }

  obtenerComentariosPorTiempo(
    filtro?: FiltroEstadisticas,
  ): Observable<{ datos: ComentarioPorTiempoEstadistica[]; total: number }> {
    const params = this.construirParams(filtro);
    return this.http.get<{
      datos: ComentarioPorTiempoEstadistica[];
      total: number;
    }>(`${this.apiUrl}/comentarios-por-tiempo`, { params });
  }

  obtenerComentariosPorPublicacion(
    filtro?: FiltroEstadisticas,
  ): Observable<ComentarioPorPublicacionEstadistica[]> {
    const params = this.construirParams(filtro);
    return this.http.get<ComentarioPorPublicacionEstadistica[]>(
      `${this.apiUrl}/comentarios-por-publicacion`,
      { params },
    );
  }
}
