import { Component, inject, signal } from
      '@angular/core';
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
      template: `
        <div class="auth-page animate-fade-in">
          <div class="auth-card card">
            <div class="dossier-stamp">MANN CO. // RECLUTAMIENTO</div>

            <div class="auth-header">
              <div class="auth-icon-wrap">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                stroke-linecap="round" stroke-linejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <line x1="20" y1="8" x2="20" y2="14"></line>
                  <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
              </div>
              <h1 class="auth-title">EXPEDIENTE DE ENLISTAMIENTO</h1>
              <p class="auth-subtitle">REGISTRO DE NUEVO OPERATIVO EN LA RED</p>
            </div>

            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" novalidate class="auth-form">
              <div class="avatar-upload-section">
                <div class="avatar-preview-wrapper">
                  @if (avatarPreview()) {
                    <img [src]="avatarPreview()" alt="Fotografía de identificación" class="avatar-preview-img" />
                  } @else {
                    <div class="avatar-placeholder">
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="2">
                        <circle cx="12" cy="8" r="4"></circle>
                        <path d="M4 20c0-4 4-6 8-6s8 2 8 6"></path>
                      </svg>
                      <span>SIN FOTO</span>
                    </div>
                  }
                </div>
                <div class="avatar-upload-info">
                  <label for="fotoPerfil" class="btn btn-secondary btn-sm upload-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17
                    8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    <span>SELECCIONAR FOTO DE PERFIL *</span>
                  </label>
                  <input
                    id="fotoPerfil"
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    (change)="onFileSelected($event)"
                    class="file-input-hidden"
                  />
                  <span class="file-hint">Formatos: JPG, PNG o WebP (Límite: 5MB)</span>
                  @if (fileError()) {
                    <div class="form-feedback feedback-error">{{ fileError() }}</div>
                  }
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="nombre" class="form-label">
                    <span>NOMBRE</span>
                    <span class="required-star">*</span>
                  </label>
                  <input
                    id="nombre"
                    type="text"
                    formControlName="nombre"
                    class="form-input"
                    [class.is-invalid]="isFieldInvalid('nombre')"
                    placeholder="ej: Lucas"
                  />
                  @if (isFieldInvalid('nombre')) {
                    <div class="form-feedback feedback-error">El nombre es obligatorio.</div>
                  }
                </div>

                <div class="form-group">
                  <label for="apellido" class="form-label">
                    <span>APELLIDO</span>
                    <span class="required-star">*</span>
                  </label>
                  <input
                    id="apellido"
                    type="text"
                    formControlName="apellido"
                    class="form-input"
                    [class.is-invalid]="isFieldInvalid('apellido')"
                    placeholder="ej: Rossi"
                  />
                  @if (isFieldInvalid('apellido')) {
                    <div class="form-feedback feedback-error">El apellido es obligatorio.</div>
                  }
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="email" class="form-label">
                    <span>CORREO ELECTRÓNICO</span>
                    <span class="required-star">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    formControlName="email"
                    class="form-input"
                    [class.is-invalid]="isFieldInvalid('email')"
                    placeholder="ej: lucas@example.com"
                  />
                  @if (isFieldInvalid('email')) {
                    <div class="form-feedback feedback-error">
                      @if (registerForm.get('email')?.hasError('required')) {
                        El correo electrónico es obligatorio.
                      } @else {
                        Formato de correo inválido.
                      }
                    </div>
                  }
                </div>

                <div class="form-group">
                  <label for="username" class="form-label">
                    <span>NOMBRE DE USUARIO</span>
                    <span class="required-star">*</span>
                  </label>
                  <input
                    id="username"
                    type="text"
                    formControlName="username"
                    class="form-input"
                    [class.is-invalid]="isFieldInvalid('username')"
                    placeholder="ej: lucasrossi"
                  />
                  @if (isFieldInvalid('username')) {
                    <div class="form-feedback feedback-error">
                      @if (registerForm.get('username')?.hasError('required')) {
                        El nombre de usuario es obligatorio.
                      } @else if (registerForm.get('username')?.hasError('minlength')) {
                        Mínimo 3 caracteres.
                      } @else {
                        Solo letras, números, puntos y guiones.
                      }
                    </div>
                  }
                </div>
              </div>

              <div class="form-group">
                <label for="fechaNacimiento" class="form-label">
                  <span>FECHA DE NACIMIENTO</span>
                  <span class="required-star">*</span>
                </label>
                <input
                  id="fechaNacimiento"
                  type="date"
                  formControlName="fechaNacimiento"
                  class="form-input"
                  [class.is-invalid]="isFieldInvalid('fechaNacimiento')"
                />
                @if (isFieldInvalid('fechaNacimiento')) {
                  <div class="form-feedback feedback-error">La fecha de nacimiento es obligatoria.</div>
                }
              </div>

              <div class="form-group">
                <label for="descripcion" class="form-label">
                  <span>DESCRIPCIÓN DE ANTECEDENTES</span>
                  <span class="feedback-hint">(Opcional)</span>
                </label>
                <textarea
                  id="descripcion"
                  formControlName="descripcion"
                  class="form-textarea"
                  rows="3"
                  placeholder="Especialidad táctica, intereses o antecedentes de servicio..."
                ></textarea>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label for="password" class="form-label">
                    <span>CONTRASEÑA</span>
                    <span class="required-star">*</span>
                  </label>
                  <input
                    id="password"
                    type="password"
                    formControlName="password"
                    class="form-input"
                    [class.is-invalid]="isFieldInvalid('password')"
                    placeholder="Mínimo 8 caracteres"
                  />
                  @if (isFieldInvalid('password')) {
                    <div class="form-feedback feedback-error">
                      @if (registerForm.get('password')?.hasError('required')) {
                        La contraseña es obligatoria.
                      } @else {
                        Mínimo 8 caracteres, 1 mayúscula y 1 número.
                      }
                    </div>
                  }
                </div>

                <div class="form-group">
                  <label for="repetirPassword" class="form-label">
                    <span>CONFIRMAR CONTRASEÑA</span>
                    <span class="required-star">*</span>
                  </label>
                  <input
                    id="repetirPassword"
                    type="password"
                    formControlName="repetirPassword"
                    class="form-input"
                    [class.is-invalid]="isFieldInvalid('repetirPassword')"
                    placeholder="Repita la contraseña"
                  />
                  @if (isFieldInvalid('repetirPassword')) {
                    <div class="form-feedback feedback-error">
                      @if (registerForm.get('repetirPassword')?.hasError('required')) {
                        Confirme su contraseña.
                      } @else {
                        Las contraseñas no coinciden.
                      }
                    </div>
                  }
                </div>
              </div>

              <div class="security-notice">
                <div class="security-notice-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                </div>
                <span><strong>DIRECTIVA DE SEGURIDAD:</strong> Su contraseña se almacena bajo encriptación hash
                (bcrypt) y se le asigna de manera inalterable el perfil inicial de <strong>usuario</strong>.</span>
              </div>

              <button
                type="submit"
                class="btn btn-primary btn-block btn-lg"
                [disabled]="isLoading()"
              >
                @if (isLoading()) {
                  <span class="spinner"></span>
                  <span>ENLISTANDO...</span>
                } @else {
                  <span>CONFIRMAR ENLISTAMIENTO</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12
                  19"></polyline></svg>
                }
              </button>
            </form>

            <div class="auth-footer">
              <p>¿Ya posee un expediente registrado? <a routerLink="/login">Inicie sesión aquí</a></p>
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
          max-width: 680px;
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
        .avatar-upload-section {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1.25rem;
          background: #ede4d3;
          border-radius: var(--radius-sm);
          border: 2px dashed var(--border);
          margin-bottom: 1.5rem;
        }
        .avatar-preview-wrapper {
          width: 84px;
          height: 84px;
          border-radius: 4px;
          overflow: hidden;
          background: #ffffff;
          border: 2px solid var(--border);
          box-shadow: var(--shadow-sm);
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .avatar-preview-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .avatar-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.2rem;
          color: var(--tf-metal-light);
          font-family: var(--font-mono);
          font-size: 0.65rem;
          font-weight: 700;
        }
        .avatar-upload-info {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .upload-btn {
          width: fit-content;
          cursor: pointer;
        }
        .file-input-hidden {
          display: none;
        }
        .file-hint {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .required-star {
          color: var(--danger);
          margin-left: 0.2rem;
        }
        .security-notice {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          background: #eaf0f4;
          border: 2px solid var(--tf-blu);
          border-radius: var(--radius-sm);
          padding: 0.85rem 1rem;
          font-size: 0.85rem;
          color: var(--tf-blu-dark);
          margin-bottom: 1.5rem;
        }
        .security-notice-icon {
          color: var(--tf-blu);
          flex-shrink: 0;
          margin-top: 0.1rem;
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
        @media (max-width: 640px) {
          .form-row { grid-template-columns: 1fr; }
          .avatar-upload-section { flex-direction: column; text-align: center; }
          .upload-btn { margin: 0 auto; }
        }
      `]
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
    