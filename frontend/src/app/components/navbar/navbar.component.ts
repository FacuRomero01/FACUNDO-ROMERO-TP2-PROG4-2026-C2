import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
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
