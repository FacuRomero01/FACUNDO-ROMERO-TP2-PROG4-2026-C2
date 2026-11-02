import {
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PublicacionesService } from '../../services/publicaciones.service';
import { ToastService } from '../../services/toast.service';
import { ModalService } from '../../services/modal.service';
import { Publicacion } from '../../models/publicacion.model';
import { PublicacionTarjetaComponent } from '../../components/publicacion-tarjeta/publicacion-tarjeta.component';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [CommonModule, RouterModule, PublicacionTarjetaComponent],
  templateUrl: './mi-perfil.component.html',
  styleUrl: './mi-perfil.component.css',
})
export class MiPerfilComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly publicacionesService = inject(PublicacionesService);
  private readonly toastService = inject(ToastService);
  private readonly modalService = inject(ModalService);

  readonly estaCargando = signal(false);
  readonly ultimasPublicaciones = signal<Publicacion[]>([]);

  ngOnInit(): void {
    this.cargarUltimasPublicaciones();
  }

  cargarUltimasPublicaciones(): void {
    const usuario = this.authService.currentUser();
    if (!usuario?._id) return;

    this.estaCargando.set(true);
    this.publicacionesService
      .obtenerUltimasPorUsuario(usuario._id, 3)
      .subscribe({
        next: (publicaciones) => {
          this.ultimasPublicaciones.set(publicaciones || []);
          this.estaCargando.set(false);
        },
        error: (error) => {
          this.estaCargando.set(false);
          const mensaje =
            error?.error?.message ||
            'Error al cargar el historial de despachos.';
          this.toastService.error(mensaje);
        },
      });
  }

  procesarDarMeGusta(publicacionId: string): void {
    this.publicacionesService.darMeGusta(publicacionId).subscribe({
      next: (publicacionActualizada) => {
        this.actualizarPublicacionEnLista(publicacionActualizada);
      },
      error: (error) => {
        const mensaje = error?.error?.message || 'Error al registrar el me gusta.';
        this.toastService.warning(mensaje);
      },
    });
  }

  procesarQuitarMeGusta(publicacionId: string): void {
    this.publicacionesService.quitarMeGusta(publicacionId).subscribe({
      next: (publicacionActualizada) => {
        this.actualizarPublicacionEnLista(publicacionActualizada);
      },
      error: (error) => {
        const mensaje = error?.error?.message || 'Error al remover el me gusta.';
        this.toastService.warning(mensaje);
      },
    });
  }

  solicitarBajaPublicacion(publicacionId: string): void {
    this.modalService.confirm(
      'CONFIRMAR BAJA DE PUBLICACIÓN',
      '¿Está seguro de que desea eliminar este despacho de su legajo?',
      () => {
        this.eliminarPublicacion(publicacionId);
      },
      'DAR DE BAJA',
      'CANCELAR',
      'danger',
    );
  }

  private eliminarPublicacion(publicacionId: string): void {
    this.publicacionesService.eliminarPublicacion(publicacionId).subscribe({
      next: () => {
        this.toastService.success('Publicación dada de baja exitosamente.');
        this.cargarUltimasPublicaciones();
      },
      error: (error) => {
        const mensaje =
          error?.error?.message || 'No se pudo eliminar la publicación.';
        this.toastService.error(mensaje);
      },
    });
  }

  private actualizarPublicacionEnLista(publicacionActualizada: Publicacion): void {
    this.ultimasPublicaciones.update((lista) =>
      lista.map((pub) =>
        pub._id === publicacionActualizada._id ? publicacionActualizada : pub,
      ),
    );
  }

  formatearFechaNacimiento(fechaStr?: string): string {
    if (!fechaStr) return 'No especificada';
    try {
      const fecha = new Date(fechaStr);
      if (isNaN(fecha.getTime())) return fechaStr;
      return new Intl.DateTimeFormat('es-AR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }).format(fecha);
    } catch {
      return fechaStr;
    }
  }

  onAvatarError(event: Event): void {
    (event.target as HTMLImageElement).src =
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="%23c7bcad"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>';
  }
}
