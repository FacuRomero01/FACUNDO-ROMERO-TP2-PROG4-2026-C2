import { Injectable, signal } from '@angular/core';

export interface ModalData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  type?: 'info' | 'success' | 'warning' | 'danger';
  onConfirm?: () => void;
  onCancel?: () => void;
}

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private readonly _activeModal = signal<ModalData | null>(null);
  readonly activeModal = this._activeModal.asReadonly();

  open(modalData: ModalData): void {
    this._activeModal.set(modalData);
  }

  confirm(
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText = 'Aceptar',
    cancelText = 'Cancelar',
    type: 'info' | 'success' | 'warning' | 'danger' = 'info',
  ): void {
    this.open({
      title,
      message,
      confirmText,
      cancelText,
      showCancel: true,
      type,
      onConfirm,
    });
  }

  alert(title: string, message: string, type: 'info' | 'success' | 'warning' | 'danger' = 'info'): void {
    this.open({
      title,
      message,
      confirmText: 'Entendido',
      showCancel: false,
      type,
    });
  }

  close(): void {
    const current = this._activeModal();
    if (current && current.onCancel) {
      current.onCancel();
    }
    this._activeModal.set(null);
  }

  handleConfirm(): void {
    const current = this._activeModal();
    if (current && current.onConfirm) {
      current.onConfirm();
    }
    this._activeModal.set(null);
  }
}
