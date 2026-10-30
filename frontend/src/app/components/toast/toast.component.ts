import { Component, inject } from '@angular/core';
    import { CommonModule } from '@angular/common';
    import { ToastService } from '../../services/toast.service';
    import { ToastMessage } from '../../models/toast.model';

    @Component({
      selector: 'app-toast',
      standalone: true,
      imports: [CommonModule],
      template: `
        <div class="toast-container" aria-live="polite">
          @for (toast of toastService.toasts(); track toast.id) {
            <div class="toast toast-{{ toast.type }}" role="alert">
              <div class="toast-icon">
                @switch (toast.type) {
                  @case ('success') {
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                  }
                  @case ('error') {
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                  }
                  @case ('warning') {
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42
                      0z"></path>
                      <line x1="12" y1="9" x2="12" y2="13"></line>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                  }
                  @default {
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                  }
                }
              </div>
              <div class="toast-content">
                @if (toast.title) {
                  <div class="toast-title">{{ toast.title }}</div>
                }
                <div class="toast-message">{{ toast.message }}</div>
              </div>
              <button class="toast-close" (click)="toastService.remove(toast.id)" aria-label="Cerrar notificación">
                &times;
              </button>
            </div>
          }
        </div>
      `,
      styles: [`
        .toast-container {
          position: fixed;
          top: 1.5rem;
          right: 1.5rem;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-width: 440px;
          width: calc(100vw - 3rem);
          pointer-events: none;
        }
        .toast {
          pointer-events: auto;
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          border-radius: var(--radius-sm);
          background: var(--bg-card);
          border: 2px solid var(--border);
          border-left: 6px solid;
          box-shadow: var(--shadow-md);
          animation: slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transition: var(--transition);
        }
        @keyframes slideIn {
          from { transform: translateX(110%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .toast-success {
          border-left-color: var(--tf-green);
        }
        .toast-success .toast-icon { color: var(--tf-green); }
        .toast-error {
          border-left-color: var(--danger);
        }
        .toast-error .toast-icon { color: var(--danger); }
        .toast-warning {
          border-left-color: var(--tf-amber);
        }
        .toast-warning .toast-icon { color: var(--tf-amber); }
        .toast-info {
          border-left-color: var(--tf-blu);
        }
        .toast-info .toast-icon { color: var(--tf-blu); }
        .toast-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          margin-top: 0.15rem;
        }
        .toast-content {
          flex: 1;
          font-size: 0.92rem;
          line-height: 1.4;
        }
        .toast-title {
          font-family: var(--font-display);
          font-size: 1.15rem;
          letter-spacing: 0.04em;
          margin-bottom: 0.15rem;
          color: var(--text-main);
        }
        .toast-message {
          color: #3b3532;
        }
        .toast-close {
          background: transparent;
          border: none;
          font-size: 1.4rem;
          line-height: 1;
          color: var(--tf-metal-light);
          cursor: pointer;
          padding: 0 0.25rem;
          border-radius: var(--radius-sm);
        }
        .toast-close:hover {
          color: var(--text-main);
        }
      `]
    })
    export class ToastComponent {
      readonly toastService = inject(ToastService);
    }
    