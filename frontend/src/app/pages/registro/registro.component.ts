import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

export const passwordMatchValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const password = control.get('password');
  const repetirPassword = control.get('repetirPassword');

  if (password && repetirPassword && password.value !== repetirPassword.value) {
    repetirPassword.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  } else if (repetirPassword && repetirPassword.hasError('passwordMismatch')) {
    repetirPassword.setErrors(null);
  }
  return null;
};

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css',
})
export class RegistroComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly avatarPreview = signal<string | null>(null);
  readonly selectedFile = signal<File | null>(null);
  readonly fileError = signal<string | null>(null);

  readonly registerForm: FormGroup = this.fb.group(
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
        [
          Validators.required,
          Validators.pattern(/^(?=.*[A-Z])(?=.*\d).{8,}$/),
        ],
      ],
      repetirPassword: ['', [Validators.required]],
      fechaNacimiento: ['', [Validators.required]],
      descripcion: [''],
    },
    { validators: passwordMatchValidator },
  );

  isFieldInvalid(field: string): boolean {
    const control = this.registerForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (!file.type.match(/^image\/(jpeg|png|jpg|webp)$/i)) {
        this.fileError.set('Formato no autorizado (solo JPG, PNG o WebP).');
        this.selectedFile.set(null);
        this.avatarPreview.set(null);
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.fileError.set('El archivo excede el límite máximo de 5MB.');
        this.selectedFile.set(null);
        this.avatarPreview.set(null);
        return;
      }

      this.fileError.set(null);
      this.selectedFile.set(file);

      const reader = new FileReader();
      reader.onload = () => {
        this.avatarPreview.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    this.registerForm.markAllAsTouched();

    if (!this.selectedFile()) {
      this.fileError.set('La fotografía de identificación es obligatoria.');
      this.toastService.warning('Debe adjuntar una fotografía para completar su expediente.');
      return;
    }

    if (this.registerForm.invalid) {
      this.toastService.warning('Revise los campos señalados en el expediente.');
      return;
    }

    this.isLoading.set(true);

    const formData = new FormData();
    formData.append('nombre', this.registerForm.get('nombre')?.value);
    formData.append('apellido', this.registerForm.get('apellido')?.value);
    formData.append('email', this.registerForm.get('email')?.value);
    formData.append('username', this.registerForm.get('username')?.value);
    formData.append('password', this.registerForm.get('password')?.value);
    formData.append('fechaNacimiento', this.registerForm.get('fechaNacimiento')?.value);
    formData.append('descripcion', this.registerForm.get('descripcion')?.value || '');
    formData.append('fotoPerfil', this.selectedFile() as File);

    this.authService.register(formData).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.toastService.success(`¡Expediente aprobado! Bienvenido, ${res.user.nombre}.`);
        this.router.navigate(['/publicaciones']);
      },
      error: (err) => {
        this.isLoading.set(false);
        const errorMsg =
          err?.error?.message ||
          (err.status === 409
            ? 'El correo o nombre de usuario ya se encuentra registrado.'
            : 'Fallo al procesar el expediente de reclutamiento.');
        this.toastService.error(errorMsg);
      },
    });
  }
}
