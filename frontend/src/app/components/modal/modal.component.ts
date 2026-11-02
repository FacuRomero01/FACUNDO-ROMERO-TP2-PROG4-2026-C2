import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
})
export class ModalComponent {
  readonly modalService = inject(ModalService);

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.modalService.close();
    }
  }
}
