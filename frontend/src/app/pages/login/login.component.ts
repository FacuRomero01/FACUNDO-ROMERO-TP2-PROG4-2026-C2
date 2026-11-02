import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly isLoading = signal(false);
  readonly showPassword = signal(false);

  readonly loginForm: FormGroup = this.fb.group({
    identificador: ['', [Validators.required]],
    password: [
      '',
      [
        Validators.required,
        Validators.pattern(/^(?=.*[A-Z])(?=.*\d).{8,}$/),
      ],
    ],
  });

  isFieldInvalid(field: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  toggleShowPassword(): void {
    this.showPassword.update((val) => !val);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.toastService.warning('Complete los campos requeridos para autorizar el ingreso.');
      return;
    }

    this.isLoading.set(true);

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.toastService.success(`¡Acceso concedido! Bienvenido, ${res.user.nombre}.`);
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/publicaciones';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.isLoading.set(false);
        const errorMsg =
          err?.error?.message ||
          (err.status === 401
            ? 'Credenciales denegadas. Verifique el usuario y la contraseña.'
            : 'Fallo de enlace con el servidor de autenticación.');
        this.toastService.error(errorMsg);
      },
    });
  }
}
