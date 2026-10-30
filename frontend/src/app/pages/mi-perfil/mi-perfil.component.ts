import { Component, inject } from '@angular/core';
    import { CommonModule } from '@angular/common';
    import { RouterModule } from '@angular/router';
    import { AuthService } from '../../services/auth.service';
    import { ToastService } from '../../services/toast.service';

    @Component({
      selector: 'app-mi-perfil',
      standalone: true,
      imports: [CommonModule, RouterModule],
      template: `
        <div class="profile-page container animate-fade-in">
          @if (authService.currentUser(); as user) {
            <div class="profile-hero card">
              <div class="profile-cover">
                <span class="dossier-id-stamp">ID OPERATIVO // #{{ user._id?.slice(-6) || 'OFICIAL' }}</span>
              </div>
              <div class="profile-hero-content">
                <div class="profile-avatar-container">
                  <img
                    [src]="authService.getAvatarUrl(user.fotoPerfil)"
                    [alt]="user.nombre"
                    class="profile-hero-avatar"
                    (error)="onAvatarError($event)"
                  />
                </div>

                <div class="profile-hero-details">
                  <div class="profile-hero-names">
                    <h1 class="profile-full-name">{{ user.nombre }} {{ user.apellido }}</h1>
                    <span class="profile-username-tag">&#64;{{ user.username }}</span>
                    <span
                      class="badge"
                      [ngClass]="user.perfil === 'administrador' ? 'badge-admin' : 'badge-usuario'"
                    >
                      ROL: {{ user.perfil }}
                    </span>
                  </div>
                  @if (user.descripcion) {
                    <p class="profile-bio-text">{{ user.descripcion }}</p>
                  }
                </div>

                <div class="profile-hero-actions">
                  <button type="button" class="btn btn-secondary btn-sm" (click)="onEditClick()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2.5"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1
                    1-4L16.5 3.5z"></path></svg>
                    <span>MODIFICAR LEGAJO</span>
                  </button>
                </div>
              </div>
            </div>

            <div class="profile-grid">
              <div class="info-card card">
                <h3 class="card-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12"
                  cy="7" r="4"></circle></svg>
                  <span>DATOS TÉCNICOS DEL EXPEDIENTE</span>
                </h3>

                <div class="details-list">
                  <div class="detail-item">
                    <span class="detail-label">NOMBRE Y APELLIDO:</span>
                    <span class="detail-value">{{ user.nombre }} {{ user.apellido }}</span>
                  </div>

                  <div class="detail-item">
                    <span class="detail-label">IDENTIFICADOR (CALLSIGN):</span>
                    <span class="detail-value">&#64;{{ user.username }}</span>
                  </div>

                  <div class="detail-item">
                    <span class="detail-label">CANAL DE CORREO:</span>
                    <span class="detail-value font-mono">{{ user.email }}</span>
                  </div>

                  <div class="detail-item">
                    <span class="detail-label">FECHA DE NACIMIENTO:</span>
                    <span class="detail-value font-mono">{{ formatBirthdate(user.fechaNacimiento) }}</span>
                  </div>

                  <div class="detail-item">
                    <span class="detail-label">NIVEL DE AUTORIZACIÓN:</span>
                    <span class="detail-value capitalize">
                      <strong>{{ user.perfil }}</strong>
                    </span>
                  </div>

                  <div class="detail-item">
                    <span class="detail-label">ESTADO DE SERVICIO:</span>
                    <span class="detail-value">
                      <span class="status-indicator">
                        <span class="status-dot"></span>
                        ACTIVO EN LÍNEA
                      </span>
                    </span>
                  </div>

                  <div class="detail-item">
                    <span class="detail-label">REGISTRO DE FOTOGRAFÍA:</span>
                    <span class="detail-value font-mono text-xs">{{ user.fotoPerfil }}</span>
                  </div>
                </div>
              </div>

              <div class="posts-card card">
                <h3 class="card-title">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0
                  2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8"
                  y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                  <span>REPORTES EMITIDOS POR EL OPERATIVO</span>
                </h3>

                <div class="sprint-notice-box">
                  <div class="notice-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14
                    14"></polyline></svg>
                  </div>
                  <div class="notice-content">
                    <h4>DIRECTIVA DE REQUERIMIENTOS // SPRINT 2</h4>
                    <p>
                      En el <strong>Sprint 2</strong>, esta sección reflejará de forma automática las últimas 3
                      publicaciones transmitidas por este usuario, con moderación, recuento de me gusta y
                      comentarios.
                    </p>
                  </div>
                </div>

                <div class="empty-state">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5" cy="8.5"
                  r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                  <p>No existen reportes previos en este legajo.</p>
                  <a routerLink="/publicaciones" class="btn btn-primary btn-sm">IR AL CANAL DE DESPACHOS</a>
                </div>
              </div>
            </div>
          }
        </div>
      `,
      styles: [`
        .profile-page {
          padding: 2rem 1rem 3rem;
        }
        .profile-hero {
          padding: 0;
          overflow: hidden;
          margin-bottom: 2rem;
        }
        .profile-cover {
          height: 140px;
          background: linear-gradient(135deg, #b8383b 0%, #8c2424 100%);
          border-bottom: 3px solid var(--border);
          position: relative;
          display: flex;
          justify-content: flex-end;
          padding: 1rem 1.5rem;
        }
        .dossier-id-stamp {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 700;
          color: #faf7f0;
          background: rgba(0, 0, 0, 0.4);
          padding: 0.25rem 0.6rem;
          border: 1px dashed #faf7f0;
          border-radius: var(--radius-sm);
          height: fit-content;
          user-select: none;
        }
        .profile-hero-content {
          padding: 0 2rem 2rem;
          display: flex;
          align-items: flex-end;
          gap: 1.5rem;
          position: relative;
        }
        .profile-avatar-container {
          margin-top: -60px;
          flex-shrink: 0;
        }
        .profile-hero-avatar {
          width: 120px;
          height: 120px;
          border-radius: 6px;
          border: 4px solid #faf7f0;
          object-fit: cover;
          box-shadow: var(--shadow-md);
          background: #ffffff;
        }
        .profile-hero-details {
          flex: 1;
          padding-top: 1rem;
        }
        .profile-hero-names {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
          margin-bottom: 0.35rem;
        }
        .profile-full-name {
          font-family: var(--font-display);
          font-size: 2.2rem;
          letter-spacing: 0.05em;
          color: var(--text-main);
          margin: 0;
          line-height: 1;
        }
        .profile-username-tag {
          font-family: var(--font-mono);
          font-size: 0.92rem;
          color: var(--text-muted);
          font-weight: 700;
        }
        .profile-bio-text {
          color: #443e3a;
          font-size: 0.95rem;
          max-width: 650px;
          line-height: 1.45;
        }
        .profile-hero-actions {
          padding-top: 1rem;
        }
        .profile-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        .card-title {
          font-family: var(--font-display);
          font-size: 1.35rem;
          letter-spacing: 0.05em;
          color: var(--text-main);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px dashed var(--border-muted);
        }
        .details-list {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }
        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e8decb;
          font-size: 0.92rem;
        }
        .detail-label {
          font-family: var(--font-display);
          font-size: 1.05rem;
          letter-spacing: 0.04em;
          color: var(--text-muted);
        }
        .detail-value {
          color: var(--text-main);
          font-weight: 700;
        }
        .capitalize {
          text-transform: capitalize;
        }
        .font-mono {
          font-family: var(--font-mono);
        }
        .text-xs {
          font-size: 0.75rem;
        }
        .status-indicator {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--tf-green);
          font-weight: 700;
          font-family: var(--font-display);
          font-size: 1rem;
          letter-spacing: 0.04em;
        }
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--tf-green);
          box-shadow: 0 0 6px var(--tf-green);
        }
        .sprint-notice-box {
          background: #fbf5ea;
          border: 2px solid var(--tf-amber);
          border-radius: var(--radius-sm);
          padding: 1rem;
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }
        .notice-icon {
          color: var(--tf-amber);
          flex-shrink: 0;
          margin-top: 0.1rem;
        }
        .notice-content h4 {
          font-family: var(--font-display);
          font-size: 1.15rem;
          letter-spacing: 0.04em;
          margin-bottom: 0.25rem;
          color: var(--text-main);
        }
        .notice-content p {
          font-size: 0.85rem;
          color: var(--text-muted);
          line-height: 1.4;
          margin: 0;
        }
        .empty-state {
          text-align: center;
          padding: 2rem 1rem;
          color: var(--tf-metal-light);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }
        .empty-state p {
          font-family: var(--font-mono);
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        @media (max-width: 820px) {
          .profile-hero-content {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .profile-avatar-container {
            margin-top: -50px;
          }
          .profile-hero-names {
            justify-content: center;
          }
          .profile-grid {
            grid-template-columns: 1fr;
          }
          .detail-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.2rem;
          }
        }
      `]
    })
    export class MiPerfilComponent {
      readonly authService = inject(AuthService);
      private readonly toastService = inject(ToastService);

      formatBirthdate(dateStr: string): string {
        if (!dateStr) return 'No especificada';
        try {
          const parts = dateStr.split('-');
          if (parts.length === 3) {
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
          }
          return dateStr;
        } catch {
          return dateStr;
        }
      }

      onEditClick(): void {
        this.toastService.info(
          'La modificación del legajo estará disponible en el Sprint 2.',
        );
      }

      onAvatarError(event: Event): void {
        (event.target as HTMLImageElement).src =
          'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="%23c7bcad"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>';
      }
    }
    