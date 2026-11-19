import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/usuarios`;

  listarUsuarios(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  crearUsuario(
    datosUsuario: FormData,
  ): Observable<{ message: string; usuario: User }> {
    return this.http.post<{ message: string; usuario: User }>(
      this.apiUrl,
      datosUsuario,
    );
  }

  deshabilitarUsuario(
    id: string,
  ): Observable<{ message: string; usuario: User }> {
    return this.http.delete<{ message: string; usuario: User }>(
      `${this.apiUrl}/${id}`,
    );
  }

  habilitarUsuario(id: string): Observable<{ message: string; usuario: User }> {
    return this.http.post<{ message: string; usuario: User }>(
      `${this.apiUrl}/${id}/habilitar`,
      {},
    );
  }
}
