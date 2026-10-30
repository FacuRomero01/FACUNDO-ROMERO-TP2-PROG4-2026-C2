import { Component, inject, signal } from
      '@angular/core';
    import { CommonModule } from '@angular/common';
    import { RouterModule } from '@angular/router';
    import { AuthService } from '../../services/auth.service';
    import { ToastService } from '../../services/toast.service';

    interface MockPost {
      id: string;
      autor: {
        nombre: string;
        apellido: string;
        username: string;
        fotoPerfil: string;
        perfil: string;
      };
      titulo: string;
      descripcion: string;
      imagenUrl?: string;
      likesCount: number;
      commentsCount: number;
      createdAt: string;
    }

    @Component({
      selector: 'app-publicaciones',
      standalone: true,
      imports: [CommonModule, RouterModule],
      template: `
        <div class="feed-page container animate-fade-in">
          <div class="feed-layout">
            <aside class="feed-sidebar">
              @if (authService.currentUser(); as user) {
                <div class="profile-card card">
                  <div class="profile-header-bg">
                    <span class="service-stamp">EXPEDIENTE ACTIVO</span>
                  </div>
                  <div class="profile-avatar-wrap">
                    <img
                      [src]="authService.getAvatarUrl(user.fotoPerfil)"
                      [alt]="user.nombre"
                      class="profile-sidebar-avatar"
                      (error)="onAvatarError($event)"
                    />
                  </div>
                  <div class="profile-sidebar-body">
                    <h3 class="profile-name">{{ user.nombre }} {{ user.apellido }}</h3>
                    <span class="profile-username">&#64;{{ user.username }}</span>
                    <span class="badge" [ngClass]="user.perfil === 'administrador' ? 'badge-admin' :
                    'badge-usuario'">
                      {{ user.perfil }}
                    </span>
                    @if (user.descripcion) {
                      <p class="profile-bio">{{ user.descripcion }}</p>
                    }
                    <hr class="profile-divider" />
                    <a routerLink="/mi-perfil" class="btn btn-secondary btn-sm btn-block">
                      CONSULTAR LEGAJO COMPLETO
                    </a>
                  </div>
                </div>
              }

              <div class="info-card card">
                <h4 class="info-title">OPERACIONES // SPRINT #1</h4>
                <p class="sprint-desc">
                  Arquitectura inicial, conexión a base de datos y autenticación de personal operativas con
                  persistencia en MongoDB.
                </p>
                <div class="sprint-badge">PRÓXIMO: SPRINT 2 (DESPACHOS DINÁMICOS)</div>
              </div>
            </aside>

            <main class="feed-main">
              <div class="sprint-banner">
                <div class="sprint-banner-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12"
                  y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                </div>
                <div>
                  <strong>DIRECTIVA DE OPERACIONES (SPRINT 1):</strong> Estructura del feed lista. La emisión,
                  borrado lógico y persistencia de despachos se habilitarán en el <strong>Sprint 2</strong>.
                </div>
              </div>

              <div class="composer-card card">
                <div class="composer-top">
                  @if (authService.currentUser(); as user) {
                    <img
                      [src]="authService.getAvatarUrl(user.fotoPerfil)"
                      [alt]="user.nombre"
                      class="composer-avatar"
                      (error)="onAvatarError($event)"
                    />
                  }
                  <input
                    type="text"
                    class="composer-input"
                    placeholder="Redactar nuevo informe de campo... (Sprint 2)"
                    (click)="onComposerClick()"
                    readonly
                  />
                </div>
                <div class="composer-actions">
                  <button type="button" class="composer-btn" (click)="onComposerClick()">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"></rect><circle cx="8.5"
                    cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    <span>ADJUNTAR FOTO</span>
                  </button>
                  <button type="button" class="btn btn-primary btn-sm" (click)="onComposerClick()">
                    TRANSMITIR
                  </button>
                </div>
              </div>

              <div class="feed-filters">
                <span class="filters-label">FILTRAR REPORTES:</span>
                <div class="filter-buttons">
                  <button
                    type="button"
                    class="filter-tab"
                    [class.active]="activeSort() === 'fecha'"
                    (click)="setSort('fecha')"
                  >
                    MÁS RECIENTES
                  </button>
                  <button
                    type="button"
                    class="filter-tab"
                    [class.active]="activeSort() === 'likes'"
                    (click)="setSort('likes')"
                  >
                    MÁS POPULARES (ME GUSTA)
                  </button>
                </div>
              </div>

              <div class="posts-list">
                @for (post of mockPosts; track post.id) {
                  <article class="post-card card">
                    <header class="post-header">
                      <div class="post-author-wrap">
                        <img
                          [src]="authService.getAvatarUrl(post.autor.fotoPerfil)"
                          [alt]="post.autor.nombre"
                          class="post-author-avatar"
                          (error)="onAvatarError($event)"
                        />
                        <div class="post-author-meta">
                          <div class="author-title-row">
                            <span class="author-name">{{ post.autor.nombre }} {{ post.autor.apellido }}</span>
                            <span class="badge" [ngClass]="post.autor.perfil === 'administrador' ? 'badge-admin' :
                            'badge-usuario'">
                              {{ post.autor.perfil }}
                            </span>
                          </div>
                          <div class="author-sub-row">
                            <span class="author-username">&#64;{{ post.autor.username }}</span>
                            <span class="post-dot">&bull;</span>
                            <time class="post-date">{{ post.createdAt }}</time>
                          </div>
                        </div>
                      </div>
                    </header>

                    <div class="post-body">
                      <h4 class="post-title">{{ post.titulo }}</h4>
                      <p class="post-text">{{ post.descripcion }}</p>
                    </div>

                    <footer class="post-footer">
                      <button type="button" class="action-btn" (click)="onActionClick('dar Me Gusta')">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2.5"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0
                        0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                        <span>{{ post.likesCount }} ME GUSTA</span>
                      </button>

                      <button type="button" class="action-btn" (click)="onActionClick('comentar')">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2.5"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0
                        0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1
                        3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                        <span>{{ post.commentsCount }} COMENTARIOS</span>
                      </button>
                    </footer>
                  </article>
                }
              </div>
            </main>
          </div>
        </div>
      `,
      styles: [`
        .feed-page {
          padding: 2rem 1rem 3rem;
        }
        .feed-layout {
          display: grid;
          grid-template-columns: 310px 1fr;
          gap: 1.75rem;
          align-items: start;
        }
        .feed-sidebar {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          position: sticky;
          top: 90px;
        }
        .profile-card {
          padding: 0;
          overflow: hidden;
          text-align: center;
        }
        .profile-header-bg {
          height: 72px;
          background: linear-gradient(135deg, #b8383b, #8c2424);
          border-bottom: 2px solid var(--border);
          display: flex;
          justify-content: flex-end;
          padding: 0.5rem 0.75rem;
        }
        .service-stamp {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          font-weight: 700;
          color: #faf7f0;
          background: rgba(0, 0, 0, 0.3);
          padding: 0.15rem 0.4rem;
          border-radius: var(--radius-sm);
          height: fit-content;
        }
        .profile-avatar-wrap {
          margin-top: -38px;
          margin-bottom: 0.5rem;
        }
        .profile-sidebar-avatar {
          width: 76px;
          height: 76px;
          border-radius: 4px;
          border: 3px solid #faf7f0;
          object-fit: cover;
          box-shadow: var(--shadow-sm);
          background: #ffffff;
        }
        .profile-sidebar-body {
          padding: 0.5rem 1.25rem 1.25rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
        }
        .profile-name {
          font-family: var(--font-display);
          font-size: 1.5rem;
          letter-spacing: 0.04em;
          color: var(--text-main);
          line-height: 1;
        }
        .profile-username {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .profile-bio {
          font-size: 0.88rem;
          color: var(--text-muted);
          margin-top: 0.4rem;
          line-height: 1.4;
        }
        .profile-divider {
          width: 100%;
          border: 0;
          border-top: 2px dashed var(--border-muted);
          margin: 0.75rem 0;
        }
        .info-title {
          font-family: var(--font-display);
          font-size: 1.25rem;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }
        .sprint-desc {
          font-size: 0.85rem;
          color: var(--text-muted);
          line-height: 1.4;
          margin-bottom: 0.85rem;
        }
        .sprint-badge {
          display: inline-block;
          font-family: var(--font-mono);
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--tf-red);
          background: var(--tf-red-light);
          border: 1px solid var(--tf-red);
          padding: 0.3rem 0.5rem;
          border-radius: var(--radius-sm);
        }
        .sprint-banner {
          background: #fbf5ea;
          border: 2px solid var(--tf-amber);
          border-left: 6px solid var(--tf-amber);
          border-radius: var(--radius-sm);
          padding: 0.85rem 1.25rem;
          font-size: 0.92rem;
          color: #5c441b;
          display: flex;
          align-items: center;
          gap: 0.85rem;
          margin-bottom: 1.5rem;
          box-shadow: var(--shadow-sm);
        }
        .sprint-banner-icon {
          color: var(--tf-amber);
          flex-shrink: 0;
        }
        .composer-card {
          margin-bottom: 1.5rem;
        }
        .composer-top {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          margin-bottom: 1rem;
        }
        .composer-avatar {
          width: 44px;
          height: 44px;
          border-radius: 4px;
          border: 2px solid var(--border);
          object-fit: cover;
        }
        .composer-input {
          flex: 1;
          padding: 0.75rem 1rem;
          background: #ffffff;
          border: 2px solid var(--border);
          border-radius: var(--radius-sm);
          font-size: 0.92rem;
          outline: none;
          cursor: pointer;
        }
        .composer-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 0.75rem;
          border-top: 2px dashed var(--border-muted);
        }
        .composer-btn {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          background: transparent;
          border: 1.5px solid transparent;
          color: var(--text-muted);
          font-family: var(--font-display);
          font-size: 1.05rem;
          letter-spacing: 0.04em;
          cursor: pointer;
          padding: 0.35rem 0.65rem;
          border-radius: var(--radius-sm);
        }
        .composer-btn:hover {
          background: #ede4d3;
          border-color: var(--border);
          color: var(--text-main);
        }
        .feed-filters {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
          gap: 0.6rem;
        }
        .filters-label {
          font-family: var(--font-display);
          font-size: 1.15rem;
          letter-spacing: 0.05em;
          color: var(--text-main);
        }
        .filter-buttons {
          display: flex;
          gap: 0.5rem;
        }
        .filter-tab {
          padding: 0.4rem 0.95rem;
          border-radius: var(--radius-sm);
          border: 2px solid var(--border);
          background: #faf7f0;
          font-family: var(--font-display);
          font-size: 1.05rem;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          cursor: pointer;
          box-shadow: var(--shadow-sm);
          transition: var(--transition);
        }
        .filter-tab.active {
          background: var(--tf-red);
          color: #ffffff;
          border-color: var(--border);
          text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.4);
        }
        .posts-list {
          display: flex;
          flex-direction: column;
          gap: 1.35rem;
        }
        .post-card {
          padding: 1.35rem 1.6rem;
        }
        .post-header {
          margin-bottom: 0.85rem;
        }
        .post-author-wrap {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }
        .post-author-avatar {
          width: 48px;
          height: 48px;
          border-radius: 4px;
          border: 2px solid var(--border);
          object-fit: cover;
        }
        .post-author-meta {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }
        .author-title-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .author-name {
          font-family: var(--font-display);
          font-size: 1.3rem;
          letter-spacing: 0.04em;
          color: var(--text-main);
          line-height: 1;
        }
        .author-sub-row {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .post-title {
          font-family: var(--font-display);
          font-size: 1.55rem;
          letter-spacing: 0.04em;
          color: var(--text-main);
          margin-bottom: 0.4rem;
          line-height: 1.1;
        }
        .post-text {
          font-size: 0.98rem;
          color: #38322f;
          line-height: 1.55;
          margin-bottom: 1.1rem;
        }
        .post-footer {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding-top: 0.85rem;
          border-top: 2px dashed var(--border-muted);
        }
        .action-btn {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          background: #faf7f0;
          border: 2px solid var(--border);
          color: var(--text-main);
          font-family: var(--font-display);
          font-size: 1.05rem;
          letter-spacing: 0.05em;
          cursor: pointer;
          padding: 0.4rem 0.85rem;
          border-radius: var(--radius-sm);
          box-shadow: 1px 1px 0 var(--border);
          transition: var(--transition);
        }
        .action-btn:hover {
          background: #ede4d3;
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
        }
        .action-btn:active {
          transform: translateY(1px);
          box-shadow: none;
        }
        @media (max-width: 900px) {
          .feed-layout { grid-template-columns: 1fr; }
          .feed-sidebar { position: static; }
        }
      `]
    })
    export class PublicacionesComponent {
      readonly authService = inject(AuthService);
      private readonly toastService = inject(ToastService);

      readonly activeSort = signal<'fecha' | 'likes'>('fecha');

      readonly mockPosts: MockPost[] = [
        {
          id: 'post-1',
          autor: {
            nombre: 'Cátedra',
            apellido: 'Programación IV',
            username: 'utn_progra4',
            fotoPerfil: '',
            perfil: 'administrador',
          },
          titulo: '¡BIENVENIDOS A LA RED OFICIAL // COMUNICADO DE ALTO MANDO!',
          descripcion:
            'Sprint 1 completado exitosamente: registro con validaciones estrictas y carga de fotos de perfil, login con JWT, base de datos MongoDB conectada y roles definidos. En el Sprint 2 comenzaremos a publicar y dar Me Gusta.',
          likesCount: 12,
          commentsCount: 3,
          createdAt: 'Hace un momento',
        },
        {
          id: 'post-2',
          autor: {
            nombre: 'Comunidad',
            apellido: 'Universitaria',
            username: 'estudiantes_utn',
            fotoPerfil: '',
            perfil: 'usuario',
          },
          titulo: 'PREPARANDO EL SPRINT 2 // LOGÍSTICA DE OPERACIONES',
          descripcion:
            'Estructura de publicaciones lista. El backend ya cuenta con los esquemas de publicaciones y la configuración adecuada para el próximo sprint.',
          likesCount: 8,
          commentsCount: 2,
          createdAt: 'Hace 1 hora',
        },
      ];

      setSort(sort: 'fecha' | 'likes'): void {
        this.activeSort.set(sort);
        this.toastService.info(
          `Filtro ordenado por ${sort === 'fecha' ? 'más recientes' : 'más populares'}. (Integración completa en
          Sprint 2)`,
        );
      }

      onComposerClick(): void {
        this.toastService.info(
          'La creación dinámica de publicaciones estará disponible a partir del Sprint 2.',
        );
      }

      onActionClick(action: string): void {
        this.toastService.info(
          `La función de ${action} estará activa en el Sprint 2 según los requerimientos de la cátedra.`,
        );
      }

      onAvatarError(event: Event): void {
        (event.target as HTMLImageElement).src =
          'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="%23c7bcad"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>';
      }
    }
    