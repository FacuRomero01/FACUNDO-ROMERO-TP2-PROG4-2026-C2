import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UsuariosService } from '../../../services/usuarios.service';
import { AuthService } from '../../../services/auth.service';
import { ModalService } from '../../../services/modal.service';
import { ToastService } from '../../../services/toast.service';
import { User } from '../../../models/user.model';
import { RolFormatoPipe } from '../../../pipes/rol-formato.pipe';
import { AcortarTextoPipe } from '../../../pipes/acortar-texto.pipe';
import { ImagenFallbackDirective } from '../../../directives/imagen-fallback.directive';
import { ResaltarFilaDirective } from '../../../directives/resaltar-fila.directive';
import { TooltipDirective } from '../../../directives/tooltip.directive';
import { passwordMatchValidator } from '../../registro/registro.component';

@Component({
  selector: 'app-dashboard-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    RolFormatoPipe,
    AcortarTextoPipe,
    ImagenFallbackDirective,
    ResaltarFilaDirective,
    TooltipDirective,
  ],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css',
})
export class UsuariosComponent implements OnInit {
  private readonly usuariosService = inject(UsuariosService);
  readonly authService = inject(AuthService);
  private readonly modalService = inject(ModalService);
  private readonly toastService = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  readonly usuarios = signal<User[]>([]);
  readonly estaCargando = signal<boolean>(false);
  readonly guardandoUsuario = signal<boolean>(false);
  readonly mostrarFormulario = signal<boolean>(false);

  readonly avatarPreview = signal<string | null>(null);
  readonly selectedFile = signal<File | null>(null);
  readonly fileError = signal<string | null>(null);

  readonly usuarioForm: FormGroup = this.fb.group(
    {
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^[a-zA-Z0-9_.-]+$/),
        ],
      ],
      password: [
        '',
        [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*\d).{8,}$/)],
      ],
      repetirPassword: ['', [Validators.required]],
      fechaNacimiento: ['', [Validators.required]],
      descripcion: [''],
      perfil: ['usuario', [Validators.required]],
    },
    { validators: passwordMatchValidator },
  );

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.estaCargando.set(true);
    this.usuariosService.listarUsuarios().subscribe({
      next: (lista) => {
        this.usuarios.set(lista);
        this.estaCargando.set(false);
      },
      error: (err) => {
        this.toastService.error(
          err.error?.message || 'Error al cargar listado de usuarios',
        );
        this.estaCargando.set(false);
      },
    });
  }

  toggleFormulario(): void {
    this.mostrarFormulario.update((v) => !v);
    if (!this.mostrarFormulario()) {
      this.resetearFormulario();
    }
  }

  resetearFormulario(): void {
    this.usuarioForm.reset({ perfil: 'usuario' });
    this.selectedFile.set(null);
    this.avatarPreview.set(null);
    this.fileError.set(null);
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (!file.type.match(/^image\/(jpg|jpeg|png|gif|webp)$/i)) {
        this.fileError.set(
          'Formato no válido. Debe ser JPG, PNG, GIF o WEBP.',
        );
        this.selectedFile.set(null);
        this.avatarPreview.set(null);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.fileError.set('La imagen supera el límite permitido de 5 MB.');
        this.selectedFile.set(null);
        this.avatarPreview.set(null);
        return;
      }

      this.fileError.set(null);
      this.selectedFile.set(file);

      const reader = new FileReader();
      reader.onload = () => this.avatarPreview.set(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  guardarNuevoUsuario(): void {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      this.toastService.error('Revise los campos del formulario');
      return;
    }

    this.guardandoUsuario.set(true);

    const formData = new FormData();
    const valores = this.usuarioForm.value;

    formData.append('nombre', valores.nombre);
    formData.append('apellido', valores.apellido);
    formData.append('email', valores.email);
    formData.append('username', valores.username);
    formData.append('password', valores.password);
    formData.append('fechaNacimiento', valores.fechaNacimiento);
    if (valores.descripcion) {
      formData.append('descripcion', valores.descripcion);
    }
    formData.append('perfil', valores.perfil || 'usuario');

    const file = this.selectedFile();
    if (file) {
      formData.append('fotoPerfil', file, file.name);
    }

    this.usuariosService.crearUsuario(formData).subscribe({
      next: (res) => {
        this.toastService.success(res.message || 'Usuario creado exitosamente');
        this.guardandoUsuario.set(false);
        this.toggleFormulario();
        this.cargarUsuarios();
      },
      error: (err) => {
        this.toastService.error(
          err.error?.message || 'Error al dar de alta el usuario',
        );
        this.guardandoUsuario.set(false);
      },
    });
  }

  confirmarDeshabilitar(usuario: User): void {
    this.modalService.confirm(
      'DESHABILITAR USUARIO',
      `¿Confirma la baja lógica de "${usuario.nombre} ${usuario.apellido}" (@${usuario.username})? El usuario no podrá volver a iniciar sesión.`,
      () => {
        this.usuariosService.deshabilitarUsuario(usuario._id).subscribe({
          next: () => {
            this.toastService.success('Usuario deshabilitado con éxito');
            this.cargarUsuarios();
          },
          error: (err) => {
            this.toastService.error(
              err.error?.message || 'No se pudo deshabilitar el usuario',
            );
          },
        });
      },
      'DESHABILITAR',
      'CANCELAR',
      'danger',
    );
  }

  confirmarHabilitar(usuario: User): void {
    this.modalService.confirm(
      'HABILITAR USUARIO',
      `¿Desea reactivar la credencial de "${usuario.nombre} ${usuario.apellido}" (@${usuario.username})? Podrá volver a acceder al sistema.`,
      () => {
        this.usuariosService.habilitarUsuario(usuario._id).subscribe({
          next: () => {
            this.toastService.success('Usuario rehabilitado con éxito');
            this.cargarUsuarios();
          },
          error: (err) => {
            this.toastService.error(
              err.error?.message || 'No se pudo habilitar el usuario',
            );
          },
        });
      },
      'HABILITAR',
      'CANCELAR',
      'info',
    );
  }
}
