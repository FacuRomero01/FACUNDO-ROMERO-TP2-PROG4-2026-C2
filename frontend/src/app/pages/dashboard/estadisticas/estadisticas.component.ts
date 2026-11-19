import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EstadisticasService } from '../../../services/estadisticas.service';
import { ToastService } from '../../../services/toast.service';
import {
  ComentarioPorPublicacionEstadistica,
  ComentarioPorTiempoEstadistica,
  PublicacionPorUsuarioEstadistica,
  ResumenEstadisticas,
} from '../../../models/estadisticas.model';
import {
  DatoBarra,
  GraficoBarrasComponent,
} from '../../../components/graficos/grafico-barras/grafico-barras.component';
import {
  DatoLinea,
  GraficoLineasComponent,
} from '../../../components/graficos/grafico-lineas/grafico-lineas.component';
import {
  DatoTorta,
  GraficoTortaComponent,
} from '../../../components/graficos/grafico-torta/grafico-torta.component';

@Component({
  selector: 'app-dashboard-estadisticas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    GraficoBarrasComponent,
    GraficoLineasComponent,
    GraficoTortaComponent,
  ],
  templateUrl: './estadisticas.component.html',
  styleUrl: './estadisticas.component.css',
})
export class EstadisticasComponent implements OnInit {
  private readonly estadisticasService = inject(EstadisticasService);
  private readonly toastService = inject(ToastService);

  readonly estaCargando = signal<boolean>(false);
  readonly filtroSeleccionado = signal<string>('30d');

  fechaDesde = '';
  fechaHasta = '';

  readonly resumen = signal<ResumenEstadisticas | null>(null);

  readonly datosBarras = signal<DatoBarra[]>([]);
  readonly datosLineas = signal<DatoLinea[]>([]);
  readonly datosTorta = signal<DatoTorta[]>([]);

  ngOnInit(): void {
    this.aplicarFiltroRapido('30d');
  }

  private formatearFechaLocal(fecha: Date): string {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }

  aplicarFiltroRapido(opcion: string): void {
    this.filtroSeleccionado.set(opcion);
    const hoy = new Date();
    this.fechaHasta = this.formatearFechaLocal(hoy);

    if (opcion === '7d') {
      const d = new Date(hoy);
      d.setDate(d.getDate() - 7);
      this.fechaDesde = this.formatearFechaLocal(d);
    } else if (opcion === '30d') {
      const d = new Date(hoy);
      d.setDate(d.getDate() - 30);
      this.fechaDesde = this.formatearFechaLocal(d);
    } else if (opcion === '90d') {
      const d = new Date(hoy);
      d.setDate(d.getDate() - 90);
      this.fechaDesde = this.formatearFechaLocal(d);
    } else if (opcion === 'todo') {
      this.fechaDesde = '';
      this.fechaHasta = '';
    }

    this.cargarDatos();
  }

  aplicarRangoPersonalizado(): void {
    this.filtroSeleccionado.set('custom');
    if (this.fechaDesde && this.fechaHasta && this.fechaDesde > this.fechaHasta) {
      this.toastService.error('La fecha inicial no puede ser posterior a la fecha final');
      return;
    }
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.estaCargando.set(true);

    const filtro: { desde?: string; hasta?: string } = {};
    if (this.fechaDesde) filtro.desde = this.fechaDesde;
    if (this.fechaHasta) filtro.hasta = this.fechaHasta;

    this.estadisticasService.obtenerResumen(filtro).subscribe({
      next: (res) => {
        this.resumen.set(res);

        // Mapear a formato de barras (Publicaciones por usuario)
        this.datosBarras.set(
          (res.publicacionesPorUsuario || []).map((p) => ({
            etiqueta: `@${p.username}`,
            valor: p.cantidad,
            subtitulo: p.nombreCompleto?.trim() || undefined,
          })),
        );

        // Mapear a formato de líneas (Comentarios por tiempo)
        this.datosLineas.set(
          (res.comentariosPorTiempo || []).map((c) => ({
            etiqueta: c.fecha,
            valor: c.cantidad,
          })),
        );

        // Mapear a formato de torta (Comentarios por publicación)
        this.datosTorta.set(
          (res.comentariosPorPublicacion || []).map((cp) => ({
            etiqueta: cp.titulo || 'Sin título',
            valor: cp.cantidad,
          })),
        );

        this.estaCargando.set(false);
      },
      error: (err) => {
        this.toastService.error(
          err.error?.message || 'Error al obtener métricas estadísticas',
        );
        this.estaCargando.set(false);
      },
    });
  }
}
