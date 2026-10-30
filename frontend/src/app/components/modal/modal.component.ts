import { Component, inject } from '@angular/core';
    import { CommonModule } from '@angular/common';
    import { ModalService } from '../../services/modal.service';

    @Component({
      selector: 'app-modal',
      standalone: true,
      imports: [CommonModule],
      template: `
        @if (modalService.activeModal(); as modal) {
          <div class="modal-overlay" (click)="onBackdropClick($event)">
            <div class="modal-dialog animate-fade-in" role="dialog" aria-modal="true">
              <div class="modal-header">
                <div class="modal-badge-icon modal-{{ modal.type || 'info' }}">
                  @switch (modal.type) {
                    @case ('danger') {
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="15" y1="9" x2="9" y2="15"></line>
                        <line x1="9" y1="9" x2="15" y2="15"></line>
                      </svg>
                    }
                    @case ('success') {
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                    }
                    @default {
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                      </svg>
                    }
                  }
                </div>
                <h3 class="modal-title">{{ modal.title }}</h3>
              </div>

              <div class="modal-body">
                <p>{{ modal.message }}</p>
              </div>

              <div class="modal-footer">
                @if (modal.showCancel) {
                  <button type="button" class="btn btn-secondary" (click)="modalService.close()">
                    {{ modal.cancelText || 'CANCELAR' }}
                  </button>
                }
                <button
                  type="button"
                  class="btn"
                  [ngClass]="modal.type === 'danger' ? 'btn-danger' : 'btn-primary'"
                  (click)="modalService.handleConfirm()"
                >
                  {{ modal.confirmText || 'CONFIRMAR' }}
                </button>
              </div>
            </div>
          </div>
        }
      `,
      styles: [`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(39, 35, 33, 0.75);
          backdrop-filter: blur(2px);
          z-index: 10000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.5rem;
        }
        .modal-dialog {
          background: var(--bg-card);
          border: 3px solid var(--border);
          border-radius: var(--radius-md);
          max-width: 500px;
          width: 100%;
          padding: 1.75rem;
          box-shadow: var(--shadow-lg);
        }
        .modal-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.1rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px dashed var(--border-muted);
        }
        .modal-badge-icon {
          width: 46px;
          height: 46px;
          border-radius: 4px;
          border: 2px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 1px 1px 0 var(--border);
        }
        .modal-badge-icon.modal-info {
          background: var(--tf-blu);
          color: #ffffff;
        }
        .modal-badge-icon.modal-success {
          background: var(--tf-green);
          color: #ffffff;
        }
        .modal-badge-icon.modal-danger {
          background: var(--danger);
          color: #ffffff;
        }
        .modal-title {
          font-family: var(--font-display);
          font-size: 1.8rem;
          letter-spacing: 0.05em;
          color: var(--text-main);
          line-height: 1;
        }
        .modal-body {
          color: #443e3a;
          font-size: 0.95rem;
          line-height: 1.5;
          margin-bottom: 1.5rem;
        }
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
        }
      `]
    })
    export class ModalComponent {
      readonly modalService = inject(ModalService);

      onBackdropClick(event: MouseEvent): void {
        if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
          this.modalService.close();
        }
      }
    }
    