import {
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { PublicacionesService } from '../../services/publicaciones.service';
import { ToastService } from '../../services/toast.service';
import { ModalService } from '../../services/modal.service';
import {
  OrdenPublicaciones,
  Publicacion,
} from '../../models/publicacion.model';
import { PublicacionTarjetaComponent } from '../../components/publicacion-tarjeta/publicacion-tarjeta.component';

@Component({
  selector: 'app-publicaciones',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    PublicacionTarjetaComponent,
  ],
  templateUrl: './publicaciones.component.html',
  styleUrl: './publicaciones.component.css',
})
export class PublicacionesComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly publicacionesService = inject(PublicacionesService);
  private readonly toastService = inject(ToastService);
  private readonly modalService = inject(ModalService);
  private readonly fb = inject(FormBuilder);

  // Estados de carga y listas
  readonly estaCargando = signal(false);
  readonly estaEnviando = signal(false);
  readonly publicaciones = signal<Publicacion[]>([]);
  readonly totalRegistros = signal(0);

  // Paginación y ordenamiento
  readonly limitePorPagina = 5;
  readonly paginaActual = signal(1);
  readonly ordenActual = signal<OrdenPublicaciones>('fecha');

  // Carga de archivo
  readonly archivoSeleccionado = signal<File | null>(null);
  readonly vistaPreviaImagen = signal<string | null>(null);

  readonly formularioPublicacion: FormGroup = this.fb.group({
    titulo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(120)]],
    descripcion: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(2000)]],
  });

  ngOnInit(): void {
    this.cargarPublicaciones();
  }

  cargarPublicaciones(): void {
    this.estaCargando.set(true);
    const offset = (this.paginaActual() - 1) * this.limitePorPagina;

    this.publicacionesService
      .obtenerPublicaciones(offset, this.limitePorPagina, this.ordenActual())
      .subscribe({
        next: (respuesta) => {
          this.publicaciones.set(respuesta.publicaciones || []);
          this.totalRegistros.set(respuesta.total || 0);
          this.estaCargando.set(false);
        },
        error: (error) => {
          this.estaCargando.set(false);
          const mensajeError =
            error?.error?.message || 'Error al sincronizar las publicaciones.';
          this.toastService.error(mensajeError);
        },
      });
  }

  cambiarOrden(nuevoOrden: OrdenPublicaciones): void {
    if (this.ordenActual() === nuevoOrden) return;
    this.ordenActual.set(nuevoOrden);
    this.paginaActual.set(1);
    this.cargarPublicaciones();
  }

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina < 1 || nuevaPagina > this.totalPaginas()) return;
    this.paginaActual.set(nuevaPagina);
    this.cargarPublicaciones();
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch {
        // Fallback para entornos donde smooth scroll no esté soportado
      }
    }
  }

  totalPaginas(): number {
    const total = this.totalRegistros();
    if (total === 0) return 1;
    return Math.ceil(total / this.limitePorPagina);
  }

  obtenerListaPaginas(): number[] {
    const total = this.totalPaginas();
    const paginas: number[] = [];
    for (let i = 1; i <= total; i++) {
      paginas.push(i);
    }
    return paginas;
  }

  alSeleccionarArchivo(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const archivo = input.files[0];
      if (archivo.size > 5 * 1024 * 1024) {
        this.toastService.error('El tamaño de la imagen no puede exceder 5MB.');
        return;
      }
      this.archivoSeleccionado.set(archivo);

      const reader = new FileReader();
      reader.onload = () => {
        this.vistaPreviaImagen.set(reader.result as string);
      };
      reader.readAsDataURL(archivo);
    }
  }

  quitarImagenSeleccionada(): void {
    this.archivoSeleccionado.set(null);
    this.vistaPreviaImagen.set(null);
  }

  enviarPublicacion(): void {
    if (this.formularioPublicacion.invalid) {
      this.formularioPublicacion.markAllAsTouched();
      this.toastService.warning('Por favor, complete todos los campos obligatorios.');
      return;
    }

    this.estaEnviando.set(true);

    const formData = new FormData();
    formData.append('titulo', this.formularioPublicacion.get('titulo')?.value);
    formData.append('descripcion', this.formularioPublicacion.get('descripcion')?.value);

    const archivo = this.archivoSeleccionado();
    if (archivo) {
      formData.append('imagen', archivo);
    }

    this.publicacionesService.crearPublicacion(formData).subscribe({
      next: () => {
        this.estaEnviando.set(false);
        this.toastService.success('Despacho transmitido exitosamente.');
        this.formularioPublicacion.reset();
        this.quitarImagenSeleccionada();
        this.paginaActual.set(1);
        this.cargarPublicaciones();
      },
      error: (error) => {
        this.estaEnviando.set(false);
        const mensajeError =
          error?.error?.message || 'Error al emitir la publicación.';
        this.toastService.error(mensajeError);
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
      '¿Está seguro de que desea eliminar este despacho? Esta acción aplicará una baja lógica en los registros centrales.',
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
        // Si borramos el único elemento de la página, retrocedemos si es posible
        if (this.publicaciones().length === 1 && this.paginaActual() > 1) {
          this.paginaActual.update((p) => p - 1);
        }
        this.cargarPublicaciones();
      },
      error: (error) => {
        const mensajeError =
          error?.error?.message || 'No se pudo eliminar la publicación.';
        this.toastService.error(mensajeError);
      },
    });
  }

  private actualizarPublicacionEnLista(publicacionActualizada: Publicacion): void {
    this.publicaciones.update((lista) =>
      lista.map((pub) =>
        pub._id === publicacionActualizada._id ? publicacionActualizada : pub,
      ),
    );
  }

  onAvatarError(event: Event): void {
    (event.target as HTMLImageElement).src =
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="%23c7bcad"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>';
  }
}
