import { Component, inject } from '@angular/core';
    import { CommonModule } from '@angular/common';
    import { Router, RouterModule } from '@angular/router';
    import { AuthService } from '../../services/auth.service';
    import { ModalService } from '../../services/modal.service';

    @Component({
      selector: 'app-navbar',
      standalone: true,
      imports: [CommonModule, RouterModule],
      template: `
        <header class="navbar">
          <div class="container navbar-content">
            <a routerLink="/" class="brand" title="Conecta - Red de Comunicaciones">
              <div class="brand-logo">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="4"></circle>
                  <line x1="12" y1="2" x2="12" y2="6"></line>
                  <line x1="12" y1="18" x2="12" y2="22"></line>
                  <line x1="2" y1="12" x2="6" y2="12"></line>
                  <line x1="18" y1="12" x2="22" y2="12"></line>
                </svg>
              </div>
              <div class="brand-text">
                <span class="brand-name">CONECTA</span>
                <span class="brand-tag">DIVISIÓN COMUNICACIONES</span>
              </div>
            </a>

            <nav class="nav-links">
              @if (authService.isAuthenticated()) {
                <a routerLink="/publicaciones" routerLinkActive="active" class="nav-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="16" rx="2"></rect>
                    <line x1="7" y1="8" x2="17" y2="8"></line>
                    <line x1="7" y1="12" x2="17" y2="12"></line>
                    <line x1="7" y1="16" x2="13" y2="16"></line>
                  </svg>
                  <span>PUBLICACIONES</span>
                </a>
                <a routerLink="/mi-perfil" routerLinkActive="active" class="nav-item">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <span>MI PERFIL</span>
                </a>
              }
            </nav>

            <div class="user-actions">
              @if (authService.currentUser(); as user) {
                <div class="user-badge-wrap">
                  <a routerLink="/mi-perfil" class="user-chip" title="Ver expediente">
                    <img
                      [src]="authService.getAvatarUrl(user.fotoPerfil)"
                      [alt]="user.nombre"
                      class="user-avatar"
                      (error)="onAvatarError($event)"
                    />
                    <div class="user-info">
                      <span class="user-name">{{ user.nombre }} {{ user.apellido }}</span>
                      <span class="user-username">&#64;{{ user.username }}</span>
                    </div>
                  </a>
                  <span class="badge" [ngClass]="user.perfil === 'administrador' ? 'badge-admin' : 'badge-usuario'">
                    {{ user.perfil }}
                  </span>
                </div>

                <button type="button" class="btn btn-secondary btn-sm btn-logout" (click)="onLogout()" title="Cerrar
                sesión">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  <span>SALIR</span>
                </button>
              } @else {
                <a routerLink="/login" class="btn btn-secondary btn-sm">INICIAR SESIÓN</a>
                <a routerLink="/registro" class="btn btn-primary btn-sm">REGISTRARSE</a>
              }
            </div>
          </div>
        </header>
      `,
      styles: [`
        .navbar {
          background: #2b2624;
          border-bottom: 3px solid #1c1817;
          position: sticky;
          top: 0;
          z-index: 1000;
          box-shadow: 0 4px 0 rgba(0, 0, 0, 0.25);
        }
        .navbar-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 68px;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
        }
        .brand-logo {
          width: 42px;
          height: 42px;
          border-radius: 4px;
          background: linear-gradient(180deg, #c74346 0%, #b8383b 100%);
          color: #ffffff;
          border: 2px solid #1c1817;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 0 #1c1817;
        }
        .brand-text {
          display: flex;
          flex-direction: column;
          line-height: 1;
        }
        .brand-name {
          font-family: var(--font-display);
          font-size: 1.6rem;
          letter-spacing: 0.08em;
          color: #faf7f0;
        }
        .brand-tag {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          font-weight: 700;
          color: #de9538;
          letter-spacing: 0.08em;
        }
        .nav-links {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.45rem 0.95rem;
          border: 2px solid transparent;
          border-radius: var(--radius-sm);
          color: #ded6cb;
          font-family: var(--font-display);
          font-size: 1.15rem;
          letter-spacing: 0.06em;
          text-decoration: none;
          transition: var(--transition);
        }
        .nav-item:hover {
          color: #ffffff;
          background: #3c3532;
          border-color: #1c1817;
          text-decoration: none;
        }
        .nav-item.active {
          color: #ffffff;
          background: var(--tf-red);
          border-color: #1c1817;
          box-shadow: 0 2px 0 #1c1817;
        }
        .user-actions {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }
        .user-badge-wrap {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: #38322f;
          padding: 0.3rem 0.6rem;
          border: 2px solid #1c1817;
          border-radius: var(--radius-sm);
        }
        .user-chip {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
        }
        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 4px;
          object-fit: cover;
          border: 2px solid #faf7f0;
          background: #ffffff;
        }
        .user-info {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        }
        .user-name {
          font-size: 0.85rem;
          font-weight: 700;
          color: #faf7f0;
        }
        .user-username {
          font-family: var(--font-mono);
          font-size: 0.72rem;
          color: #c7bcad;
        }
        .btn-logout {
          border-color: #1c1817;
        }
        @media (max-width: 820px) {
          .user-info { display: none; }
          .brand-tag { display: none; }
          .nav-item span { display: none; }
        }
      `]
    })
    export class NavbarComponent {
      readonly authService = inject(AuthService);
      private readonly modalService = inject(ModalService);

      onLogout(): void {
        this.modalService.confirm(
          'CERRAR SESIÓN',
          '¿Confirma que desea desconectar su terminal de la red de comunicaciones?',
          () => {
            this.authService.logout();
          },
          'DESCONECTAR',
          'CANCELAR',
          'danger'
        );
      }

      onAvatarError(event: Event): void {
        (event.target as HTMLImageElement).src =
          'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="%23c7bcad"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>';
      }
    }
    