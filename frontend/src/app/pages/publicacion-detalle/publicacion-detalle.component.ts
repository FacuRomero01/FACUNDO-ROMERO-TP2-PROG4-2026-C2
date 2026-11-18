import {
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { PublicacionesService } from '../../services/publicaciones.service';
import { ToastService } from '../../services/toast.service';
import { ModalService } from '../../services/modal.service';
import { Comentario, Publicacion } from '../../models/publicacion.model';

@Component({
  selector: 'app-publicacion-detalle',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './publicacion-detalle.component.html',
  styleUrl: './publicacion-detalle.component.css',
})
export class PublicacionDetalleComponent implements OnInit {
  readonly authService = inject(AuthService);
  readonly publicacionesService = inject(PublicacionesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);
  private readonly modalService = inject(ModalService);
  private readonly fb = inject(FormBuilder);

  readonly publicacionId = signal<string>('');
  readonly publicacion = signal<Publicacion | null>(null);
  readonly comentarios = signal<Comentario[]>([]);

  readonly estaCargando = signal(true);
  readonly cargandoMasComentarios = signal(false);
  readonly enviandoComentario = signal(false);
  readonly guardandoEdicion = signal(false);

  // Paginación de comentarios
  readonly limitePorCarga = 5;
  readonly totalComentarios = signal(0);
  readonly hayMasComentarios = computed(
    () => this.comentarios().length < this.totalComentarios(),
  );

  // Modo edición de comentario
  readonly comentarioEnEdicionId = signal<string | null>(null);
  readonly textoEdicion = signal<string>('');

  readonly formularioComentario: FormGroup = this.fb.group({
    mensaje: [
      '',
      [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(1000),
      ],
    ],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.toastService.error('Identificador de publicación no proporcionado');
      this.router.navigate(['/publicaciones']);
      return;
    }

    this.publicacionId.set(id);
    this.cargarDetalle(id);
  }

  cargarDetalle(id: string): void {
    this.estaCargando.set(true);

    this.publicacionesService.obtenerPublicacionPorId(id).subscribe({
      next: (pub) => {
        this.publicacion.set(pub);
        this.cargarComentariosIniciales(id);
      },
      error: () => {
        this.estaCargando.set(false);
        this.toastService.error('No se pudo encontrar la publicación solicitada');
        this.router.navigate(['/publicaciones']);
      },
    });
  }

  cargarComentariosIniciales(publicacionId: string): void {
    this.publicacionesService
      .obtenerComentarios(publicacionId, 0, this.limitePorCarga)
      .subscribe({
        next: (res) => {
          this.comentarios.set(res.comentarios || []);
          this.totalComentarios.set(res.total ?? (res.comentarios ? res.comentarios.length : 0));
          this.estaCargando.set(false);
        },
        error: () => {
          // Fallback a los comentarios incluidos en la publicación
          const pub = this.publicacion();
          const comentPub = pub?.comentarios || [];
          this.comentarios.set(comentPub);
          this.totalComentarios.set(comentPub.length);
          this.estaCargando.set(false);
        },
      });
  }

  cargarMasComentarios(): void {
    if (this.cargandoMasComentarios() || !this.hayMasComentarios()) {
      return;
    }

    this.cargandoMasComentarios.set(true);
    const offset = this.comentarios().length;

    this.publicacionesService
      .obtenerComentarios(this.publicacionId(), offset, this.limitePorCarga)
      .subscribe({
        next: (res) => {
          this.comentarios.update((anteriores) => [
            ...anteriores,
            ...(res.comentarios || []),
          ]);
          this.totalComentarios.set(res.total);
          this.cargandoMasComentarios.set(false);
        },
        error: () => {
          this.toastService.error('No se pudieron obtener más comentarios');
          this.cargandoMasComentarios.set(false);
        },
      });
  }

  enviarComentario(): void {
    if (this.formularioComentario.invalid || this.enviandoComentario()) {
      return;
    }

    const mensaje = this.formularioComentario.get('mensaje')?.value?.trim();
    if (!mensaje) {
      return;
    }

    this.enviandoComentario.set(true);

    this.publicacionesService
      .crearComentario(this.publicacionId(), mensaje)
      .subscribe({
        next: (nuevoComentario) => {
          this.comentarios.update((lista) => [nuevoComentario, ...lista]);
          this.totalComentarios.update((total) => total + 1);

          // Actualizar contador en la publicación
          const pub = this.publicacion();
          if (pub) {
            this.publicacion.set({
              ...pub,
              comentarios: [nuevoComentario, ...(pub.comentarios || [])],
            });
          }

          this.formularioComentario.reset();
          this.enviandoComentario.set(false);
          this.toastService.success('Comentario registrado con éxito');
        },
        error: () => {
          this.enviandoComentario.set(false);
          this.toastService.error('No se pudo enviar el comentario');
        },
      });
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
    if (!nuevoTexto) {
      this.toastService.warning('El mensaje del comentario no puede estar vacío');
      return;
    }

    this.guardandoEdicion.set(true);

    this.publicacionesService
      .editarComentario(this.publicacionId(), comentario._id, nuevoTexto)
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

          this.cancelarEdicion();
          this.guardandoEdicion.set(false);
          this.toastService.success('Comentario modificado correctamente');
        },
        error: () => {
          this.guardandoEdicion.set(false);
          this.toastService.error('No se pudo modificar el comentario');
        },
      });
  }

  puedeEditarComentario(comentario: Comentario): boolean {
    const usuarioActual = this.authService.currentUser();
    if (!usuarioActual || !comentario.autor) {
      return false;
    }
    const autorId =
      comentario.autor._id || (comentario.autor as any).id;
    return autorId === usuarioActual._id;
  }

  yaDioMeGusta(): boolean {
    const pub = this.publicacion();
    const usuario = this.authService.currentUser();
    if (!pub || !usuario || !pub.meGusta) {
      return false;
    }
    return pub.meGusta.some((idLike) => idLike === usuario._id);
  }

  puedeEliminar(): boolean {
    const pub = this.publicacion();
    const usuario = this.authService.currentUser();
    if (!pub || !usuario) {
      return false;
    }
    if (usuario.perfil === 'administrador') {
      return true;
    }
    return pub.autor?._id === usuario._id;
  }

  toggleMeGusta(): void {
    const pub = this.publicacion();
    if (!pub) return;

    const accion$ = this.yaDioMeGusta()
      ? this.publicacionesService.quitarMeGusta(pub._id)
      : this.publicacionesService.darMeGusta(pub._id);

    accion$.subscribe({
      next: (publicacionActualizada) => {
        this.publicacion.set(publicacionActualizada);
      },
      error: () => {
        this.toastService.error('Error al actualizar me gusta');
      },
    });
  }

  confirmarEliminacion(): void {
    const pub = this.publicacion();
    if (!pub) return;

    this.modalService.confirm(
      'Dar de baja publicación',
      `¿Está seguro de que desea dar de baja la publicación "${pub.titulo}"? Esta acción no se puede deshacer.`,
      () => {
        this.publicacionesService.eliminarPublicacion(pub._id).subscribe({
          next: () => {
            this.toastService.success('Publicación dada de baja exitosamente');
            this.router.navigate(['/publicaciones']);
          },
          error: () => {
            this.toastService.error('No se pudo dar de baja la publicación');
          },
        });
      },
      'Dar de baja',
      'Cancelar',
      'danger',
    );
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
