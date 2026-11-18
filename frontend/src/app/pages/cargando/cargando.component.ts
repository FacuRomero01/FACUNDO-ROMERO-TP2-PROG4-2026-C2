import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cargando',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cargando.component.html',
  styleUrl: './cargando.component.css',
})
export class CargandoComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    const token = this.authService.token();
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.authService.autorizar().subscribe({
      next: (res) => {
        if (res && res.valid) {
          this.router.navigate(['/publicaciones']);
        } else {
          this.authService.logout();
        }
      },
      error: () => {
        this.authService.logout();
      },
    });
  }
}
