import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Comentario, Publicacion } from '../../models/publicacion.model';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { PublicacionesService } from '../../services/publicaciones.service';
import { TiempoRelativoPipe } from '../../pipes/tiempo-relativo.pipe';
import { AcortarTextoPipe } from '../../pipes/acortar-texto.pipe';
import { ImagenFallbackDirective } from '../../directives/imagen-fallback.directive';
import { TooltipDirective } from '../../directives/tooltip.directive';

@Component({
  selector: 'app-publicacion-tarjeta',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    TiempoRelativoPipe,
    AcortarTextoPipe,
    ImagenFallbackDirective,
    TooltipDirective,
  ],
  templateUrl: './publicacion-tarjeta.component.html',
  styleUrl: './publicacion-tarjeta.component.css',
})
export class PublicacionTarjetaComponent implements OnInit, OnChanges {
  readonly authService = inject(AuthService);
  readonly publicacionesService = inject(PublicacionesService);

  @Input({ required: true }) publicacion!: Publicacion;
  @Input() usuarioActual: User | null = null;
  @Input() siempreMostrarComentarios = false;

  @Output() alDarMeGusta = new EventEmitter<string>();
  @Output() alQuitarMeGusta = new EventEmitter<string>();
  @Output() alEliminar = new EventEmitter<string>();

  readonly desplegarComentarios = signal(false);

  // Paginación y listado de comentarios
  readonly limitePorCarga = 3;
  readonly comentarios = signal<Comentario[]>([]);
  readonly totalComentarios = signal(0);
  readonly cargandoComentarios = signal(false);
  readonly comentariosInicializados = signal(false);

  readonly hayMasComentarios = computed(
    () => this.comentarios().length < this.totalComentarios(),
  );

  // Formulario rápido para nuevo comentario
  readonly nuevoComentarioTexto = signal('');
  readonly enviandoComentario = signal(false);

  // Edición de comentario inline
  readonly comentarioEnEdicionId = signal<string | null>(null);
  readonly textoEdicion = signal('');
  readonly guardandoEdicion = signal(false);
  readonly comentariosExpandidos = signal<Set<string>>(new Set<string>());
  readonly descripcionExpandida = signal(false);

  ngOnInit(): void {
    this.sincronizarComentariosDesdePublicacion();
    if (this.siempreMostrarComentarios) {
      this.cargarComentariosIniciales();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['publicacion'] && !this.comentariosInicializados()) {
      this.sincronizarComentariosDesdePublicacion();
    }
  }

  private sincronizarComentariosDesdePublicacion(): void {
    if (this.publicacion?.comentarios && this.publicacion.comentarios.length > 0) {
      const ordenados = [...this.publicacion.comentarios].sort((a, b) => {
        const tA = new Date(a.createdAt || 0).getTime();
        const tB = new Date(b.createdAt || 0).getTime();
        return tB - tA;
      });
      this.totalComentarios.set(ordenados.length);
      this.comentarios.set(ordenados.slice(0, this.limitePorCarga));
    } else {
      this.totalComentarios.set(0);
      this.comentarios.set([]);
    }
  }

  toggleComentarios(): void {
    this.desplegarComentarios.update((valor) => !valor);
    if (this.desplegarComentarios() && !this.comentariosInicializados()) {
      this.cargarComentariosIniciales();
    }
  }

  cargarComentariosIniciales(): void {
    if (!this.publicacion?._id) return;

    // Si ya dispone de comentarios locales en el objeto de la publicación
    if (this.publicacion.comentarios && this.publicacion.comentarios.length > 0) {
      this.sincronizarComentariosDesdePublicacion();
      this.comentariosInicializados.set(true);
      return;
    }

    // Si no tiene comentarios precargados y existe el servicio
    if (typeof this.publicacionesService?.obtenerComentarios === 'function') {
      this.cargandoComentarios.set(true);
      this.publicacionesService
        .obtenerComentarios(this.publicacion._id, 0, this.limitePorCarga)
        .subscribe({
          next: (res) => {
            this.comentarios.set(res.comentarios || []);
            this.totalComentarios.set(
              res.total ?? (res.comentarios ? res.comentarios.length : 0),
            );
            this.comentariosInicializados.set(true);
            this.cargandoComentarios.set(false);
          },
          error: () => {
            this.sincronizarComentariosDesdePublicacion();
            this.comentariosInicializados.set(true);
            this.cargandoComentarios.set(false);
          },
        });
    } else {
      this.sincronizarComentariosDesdePublicacion();
      this.comentariosInicializados.set(true);
    }
  }

  cargarMasComentarios(): void {
    if (this.cargandoComentarios() || !this.hayMasComentarios()) {
      return;
    }

    const offset = this.comentarios().length;
    const ordenados = [...(this.publicacion?.comentarios || [])].sort((a, b) => {
      const tA = new Date(a.createdAt || 0).getTime();
      const tB = new Date(b.createdAt || 0).getTime();
      return tB - tA;
    });

    // Si los comentarios ya están cargados en memoria dentro de la publicación
    if (ordenados.length > offset) {
      const nuevos = ordenados.slice(offset, offset + this.limitePorCarga);
      this.comentarios.update((anteriores) => [...anteriores, ...nuevos]);
      return;
    }

    // Si hay más en la base de datos remota
    if (typeof this.publicacionesService?.obtenerComentarios === 'function') {
      this.cargandoComentarios.set(true);
      this.publicacionesService
        .obtenerComentarios(this.publicacion._id, offset, this.limitePorCarga)
        .subscribe({
          next: (res) => {
            this.comentarios.update((anteriores) => [
              ...anteriores,
              ...(res.comentarios || []),
            ]);
            this.totalComentarios.set(res.total);
            this.cargandoComentarios.set(false);
          },
          error: () => {
            this.cargandoComentarios.set(false);
          },
        });
    }
  }

  enviarComentario(): void {
    const mensaje = this.nuevoComentarioTexto().trim();
    if (!mensaje || this.enviandoComentario()) return;

    this.enviandoComentario.set(true);

    if (typeof this.publicacionesService?.crearComentario === 'function') {
      this.publicacionesService
        .crearComentario(this.publicacion._id, mensaje)
        .subscribe({
          next: (nuevoComentario) => {
            this.comentarios.update((anteriores) => [
              nuevoComentario,
              ...anteriores,
            ]);
            this.totalComentarios.update((t) => t + 1);

            if (this.publicacion.comentarios) {
              this.publicacion.comentarios.unshift(nuevoComentario);
            } else {
              this.publicacion.comentarios = [nuevoComentario];
            }

            this.nuevoComentarioTexto.set('');
            this.enviandoComentario.set(false);
          },
          error: () => {
            this.enviandoComentario.set(false);
          },
        });
    } else {
      this.enviandoComentario.set(false);
    }
  }

  puedeEditarComentario(comentario: Comentario): boolean {
    if (!this.usuarioActual || !comentario.autor) return false;
    const autorId = comentario.autor._id || (comentario.autor as any).id;
    return autorId === this.usuarioActual._id;
  }

  iniciarEdicion(comentario: Comentario): void {
    if (!comentario._id) return;
    this.comentarioEnEdicionId.set(comentario._id);
    this.textoEdicion.set(comentario.mensaje);
  }

  cancelarEdicion(): void {
    this.comentarioEnEdicionId.set(null);
    this.textoEdicion.set('');
  }

  guardarEdicion(comentario: Comentario): void {
    if (!comentario._id) return;
    const nuevoTexto = this.textoEdicion().trim();
    if (!nuevoTexto || this.guardandoEdicion()) return;

    this.guardandoEdicion.set(true);

    if (typeof this.publicacionesService?.editarComentario === 'function') {
      this.publicacionesService
        .editarComentario(this.publicacion._id, comentario._id, nuevoTexto)
        .subscribe({
          next: (comentarioActualizado) => {
            this.comentarios.update((lista) =>
              lista.map((c) =>
                c._id === comentario._id
                  ? {
                      ...c,
                      mensaje: comentarioActualizado.mensaje,
                      modificado: true,
                    }
                  : c,
              ),
            );

            if (this.publicacion.comentarios) {
              this.publicacion.comentarios = this.publicacion.comentarios.map((c) =>
                c._id === comentario._id
                  ? {
                      ...c,
                      mensaje: comentarioActualizado.mensaje,
                      modificado: true,
                    }
                  : c,
              );
            }

            this.cancelarEdicion();
            this.guardandoEdicion.set(false);
          },
          error: () => {
            this.guardandoEdicion.set(false);
          },
        });
    } else {
      this.guardandoEdicion.set(false);
    }
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

  alternarDescripcion(): void {
    this.descripcionExpandida.update((valor) => !valor);
  }

  alternarComentarioExpandido(id?: string): void {
    if (!id) return;
    const actual = new Set(this.comentariosExpandidos());
    if (actual.has(id)) {
      actual.delete(id);
    } else {
      actual.add(id);
    }
    this.comentariosExpandidos.set(actual);
  }

  estaComentarioExpandido(id?: string): boolean {
    return !!id && this.comentariosExpandidos().has(id);
  }

  onAvatarError(event: Event): void {
    (event.target as HTMLImageElement).src =
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="%23c7bcad"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>';
  }
}
