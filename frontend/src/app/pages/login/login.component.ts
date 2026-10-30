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
      template: `
        <div class="auth-page animate-fade-in">
          <div class="auth-card card">
            <div class="dossier-stamp">CONFIDENCIAL // TF2-OPS</div>

            <div class="auth-header">
              <div class="auth-icon-wrap">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <h1 class="auth-title">TERMINAL DE ACCESO</h1>
              <p class="auth-subtitle">IDENTIFICACIÓN OBLIGATORIA DE PERSONAL</p>
            </div>

            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" novalidate class="auth-form">
              <div class="form-group">
                <label for="identificador" class="form-label">
                  <span>USUARIO O CORREO ELECTRÓNICO</span>
                  <span class="required-star">*</span>
                </label>
                <div class="input-icon-wrapper">
                  <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <input
                    id="identificador"
                    type="text"
                    formControlName="identificador"
                    class="form-input"
                    [class.is-invalid]="isFieldInvalid('identificador')"
                    placeholder="ej: soldado77 o soldado@correo.com"
                    autocomplete="username"
                  />
                </div>
                @if (isFieldInvalid('identificador')) {
                  <div class="form-feedback feedback-error">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12"
                    y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    El usuario o correo electrónico es obligatorio.
                  </div>
                }
              </div>

              <div class="form-group">
                <label for="password" class="form-label">
                  <span>CONTRASEÑA DE SEGURIDAD</span>
                  <span class="required-star">*</span>
                </label>
                <div class="input-icon-wrapper">
                  <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                  <input
                    id="password"
                    [type]="showPassword() ? 'text' : 'password'"
                    formControlName="password"
                    class="form-input"
                    [class.is-invalid]="isFieldInvalid('password')"
                    placeholder="••••••••"
                    autocomplete="current-password"
                  />
                  <button
                    type="button"
                    class="btn-toggle-eye"
                    (click)="toggleShowPassword()"
                    [attr.aria-label]="showPassword() ? 'Ocultar contraseña' : 'Ver contraseña'"
                  >
                    @if (showPassword()) {
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1
                      5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3
                      0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    } @else {
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12"
                      cy="12" r="3"></circle></svg>
                    }
                  </button>
                </div>
                @if (isFieldInvalid('password')) {
                  <div class="form-feedback feedback-error">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12"
                    y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    @if (loginForm.get('password')?.hasError('required')) {
                      La contraseña es obligatoria.
                    } @else if (loginForm.get('password')?.hasError('pattern')) {
                      Debe tener al menos 8 caracteres, una mayúscula y un número.
                    }
                  </div>
                }
              </div>

              <button
                type="submit"
                class="btn btn-primary btn-block btn-lg"
                [disabled]="isLoading()"
              >
                @if (isLoading()) {
                  <span class="spinner"></span>
                  <span>AUTORIZANDO...</span>
                } @else {
                  <span>AUTORIZAR INGRESO</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12
                  19"></polyline></svg>
                }
              </button>
            </form>

            <div class="auth-footer">
              <p>¿Sin credenciales activas? <a routerLink="/registro">Formulario de Reclutamiento</a></p>
            </div>
          </div>
        </div>
      `,
      styles: [`
        .auth-page {
          min-height: calc(100vh - 120px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2.5rem 1rem;
        }
        .auth-card {
          max-width: 480px;
          width: 100%;
          background: var(--bg-card);
          border: 3px solid var(--border);
          border-radius: var(--radius-md);
          padding: 2.5rem 2.25rem;
          box-shadow: var(--shadow-lg);
          position: relative;
        }
        .dossier-stamp {
          position: absolute;
          top: 1rem;
          right: 1.25rem;
          border: 2px dashed #b8383b;
          color: #b8383b;
          font-family: var(--font-mono);
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.15rem 0.45rem;
          transform: rotate(3deg);
          user-select: none;
        }
        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .auth-icon-wrap {
          width: 58px;
          height: 58px;
          border-radius: 4px;
          background: var(--tf-red);
          color: #ffffff;
          border: 2px solid var(--border);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.75rem;
          box-shadow: 0 3px 0 var(--border);
        }
        .auth-title {
          font-family: var(--font-display);
          font-size: 2.3rem;
          letter-spacing: 0.05em;
          color: var(--text-main);
          line-height: 1;
          margin-bottom: 0.25rem;
        }
        .auth-subtitle {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.08em;
        }
        .required-star {
          color: var(--danger);
          margin-left: 0.2rem;
        }
        .input-icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        .input-icon {
          position: absolute;
          left: 1rem;
          color: var(--tf-metal-light);
          pointer-events: none;
        }
        .input-icon-wrapper .form-input {
          padding-left: 2.75rem;
          padding-right: 2.75rem;
        }
        .btn-toggle-eye {
          position: absolute;
          right: 0.75rem;
          background: transparent;
          border: none;
          color: var(--tf-metal-light);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 0.35rem;
          border-radius: var(--radius-sm);
        }
        .btn-toggle-eye:hover {
          color: var(--text-main);
        }
        .auth-footer {
          text-align: center;
          margin-top: 1.75rem;
          padding-top: 1.25rem;
          border-top: 2px dashed var(--border-muted);
          font-size: 0.95rem;
          color: var(--text-muted);
        }
        .spinner {
          width: 18px;
          height: 18px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `]
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
    