import {
  Component,
  EventEmitter,
  Input,
  Output,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Publicacion } from '../../models/publicacion.model';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { PublicacionesService } from '../../services/publicaciones.service';

@Component({
  selector: 'app-publicacion-tarjeta',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './publicacion-tarjeta.component.html',
  styleUrl: './publicacion-tarjeta.component.css',
})
export class PublicacionTarjetaComponent {
  readonly authService = inject(AuthService);
  readonly publicacionesService = inject(PublicacionesService);

  @Input({ required: true }) publicacion!: Publicacion;
  @Input() usuarioActual: User | null = null;
  @Input() siempreMostrarComentarios = false;

  @Output() alDarMeGusta = new EventEmitter<string>();
  @Output() alQuitarMeGusta = new EventEmitter<string>();
  @Output() alEliminar = new EventEmitter<string>();

  readonly desplegarComentarios = signal(false);

  toggleComentarios(): void {
    this.desplegarComentarios.update((valor) => !valor);
  }

  yaDioMeGusta(): boolean {
    if (!this.usuarioActual || !this.publicacion.meGusta) {
      return false;
    }
    const idUsuario = this.usuarioActual._id;
    return this.publicacion.meGusta.some((idLike) => idLike === idUsuario);
  }

  puedeEliminar(): boolean {
    if (!this.usuarioActual) {
      return false;
    }
    if (this.usuarioActual.perfil === 'administrador') {
      return true;
    }
    const autorId = this.publicacion.autor?._id;
    return autorId === this.usuarioActual._id;
  }

  onToggleMeGusta(): void {
    if (this.yaDioMeGusta()) {
      this.alQuitarMeGusta.emit(this.publicacion._id);
    } else {
      this.alDarMeGusta.emit(this.publicacion._id);
    }
  }

  onEliminarClick(): void {
    this.alEliminar.emit(this.publicacion._id);
  }

  formatearFecha(fechaStr?: string | Date): string {
    if (!fechaStr) return '';
    try {
      const fecha = new Date(fechaStr);
      if (isNaN(fecha.getTime())) return String(fechaStr);
      return new Intl.DateTimeFormat('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(fecha);
    } catch {
      return String(fechaStr);
    }
  }

  onAvatarError(event: Event): void {
    (event.target as HTMLImageElement).src =
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="%23c7bcad"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>';
  }
}
