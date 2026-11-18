import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, LoginDto, User } from '../models/user.model';
import { ModalService } from './modal.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly modalService = inject(ModalService);
  private readonly toastService = inject(ToastService);

  private readonly TOKEN_KEY = 'conecta_auth_token';
  private readonly USER_KEY = 'conecta_auth_user';

  private readonly _currentUser = signal<User | null>(this.loadStoredUser());
  private readonly _token = signal<string | null>(this.loadStoredToken());

  private temporizadorAdvertencia: any = null;
  private temporizadorExpiracion: any = null;

  readonly currentUser = this._currentUser.asReadonly();
  readonly token = this._token.asReadonly();
  readonly isAuthenticated = computed(() => !!this._token());
  readonly isAdmin = computed(
    () => this._currentUser()?.perfil === 'administrador',
  );

  constructor() {
    const tokenInicial = this._token();
    if (tokenInicial) {
      this.iniciarTemporizadorSesion(tokenInicial);
    }
  }

  login(credentials: LoginDto): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((response) => {
          this.setSession(response.token, response.user);
        }),
      );
  }

  register(formData: FormData): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/registro`, formData)
      .pipe(
        tap((response) => {
          this.setSession(response.token, response.user);
        }),
      );
  }

  autorizar(): Observable<{ valid: boolean; user: User }> {
    return this.http
      .post<{ valid: boolean; user: User }>(
        `${environment.apiUrl}/auth/autorizar`,
        {},
      )
      .pipe(
        tap((res) => {
          if (res && res.user) {
            this.actualizarUsuario(res.user);
            if (!this.temporizadorAdvertencia && this._token()) {
              this.iniciarTemporizadorSesion(this._token()!);
            }
          }
        }),
      );
  }

  refrescar(): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/refrescar`, {})
      .pipe(
        tap((response) => {
          this.setSession(response.token, response.user);
        }),
      );
  }

  logout(): void {
    this.limpiarTemporizadores();
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._token.set(null);
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  setSession(token: string, user: User): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this._token.set(token);
    this._currentUser.set(user);
    this.iniciarTemporizadorSesion(token);
  }

  actualizarUsuario(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this._currentUser.set(user);
  }

  getAvatarUrl(fotoPerfil?: string): string {
    if (!fotoPerfil) {
      return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="%23cbd5e1"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>';
    }
    if (fotoPerfil.startsWith('http://') || fotoPerfil.startsWith('https://')) {
      return fotoPerfil;
    }
    return `${environment.baseUrl}${fotoPerfil}`;
  }

  private iniciarTemporizadorSesion(token: string): void {
    this.limpiarTemporizadores();

    let tiempoHastaAviso = 10 * 60 * 1000; // 10 minutos por defecto
    let tiempoHastaVencimiento = 15 * 60 * 1000; // 15 minutos por defecto

    try {
      const partes = token.split('.');
      if (partes.length === 3) {
        const payloadBase64 = partes[1].replace(/-/g, '+').replace(/_/g, '/');
        const payloadJson = decodeURIComponent(
          atob(payloadBase64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join(''),
        );
        const payload = JSON.parse(payloadJson);

        if (payload.exp) {
          const milisegundosRestantes = payload.exp * 1000 - Date.now();
          if (milisegundosRestantes <= 0) {
            this.logout();
            return;
          }
          tiempoHastaVencimiento = milisegundosRestantes;
          // El aviso ocurre 5 minutos antes de expirar
          tiempoHastaAviso = Math.max(0, milisegundosRestantes - 5 * 60 * 1000);
        }
      }
    } catch {
      // Si falla decodificación de JWT, usar los tiempos estándar
    }

    this.temporizadorAdvertencia = setTimeout(() => {
      this.mostrarModalExpiracion();
    }, tiempoHastaAviso);

    this.temporizadorExpiracion = setTimeout(() => {
      this.modalService.close();
      this.toastService.warning('Tu sesión ha finalizado. Por favor, ingresa de nuevo.');
      this.logout();
    }, tiempoHastaVencimiento);
  }

  private mostrarModalExpiracion(): void {
    this.modalService.confirm(
      'Aviso de caducidad de sesión',
      'Quedan 5 minutos de sesión. ¿Deseas extender tu sesión para continuar navegando?',
      () => {
        this.refrescar().subscribe({
          next: () => {
            this.toastService.success('Sesión extendida correctamente');
          },
          error: () => {
            this.toastService.error('No se pudo extender la sesión');
            this.logout();
          },
        });
      },
      'Extender sesión',
      'Cerrar sesión',
      'warning',
    );
  }

  private limpiarTemporizadores(): void {
    if (this.temporizadorAdvertencia) {
      clearTimeout(this.temporizadorAdvertencia);
      this.temporizadorAdvertencia = null;
    }
    if (this.temporizadorExpiracion) {
      clearTimeout(this.temporizadorExpiracion);
      this.temporizadorExpiracion = null;
    }
  }

  private loadStoredToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private loadStoredUser(): User | null {
    try {
      const stored = localStorage.getItem(this.USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
}
