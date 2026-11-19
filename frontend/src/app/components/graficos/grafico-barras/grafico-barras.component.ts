import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DatoBarra {
  etiqueta: string;
  valor: number;
  subtitulo?: string;
}

@Component({
  selector: 'app-grafico-barras',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grafico-container">
      @if (titulo) {
        <h4 class="grafico-titulo">{{ titulo }}</h4>
      }

      @if (!datos || datos.length === 0) {
        <div class="grafico-vacio">
          <p>NO SE REGISTRAN ACTIVIDADES EN EL PERÍODO SELECCIONADO</p>
        </div>
      } @else {
        <div class="barras-lista">
          @for (item of datos; track item.etiqueta; let idx = $index) {
            <div class="barra-item">
              <div class="barra-header">
                <span class="barra-etiqueta" [title]="item.etiqueta">
                  {{ item.etiqueta }}
                </span>
                <span class="barra-valor">{{ item.valor }}</span>
              </div>
              <div class="barra-fondo">
                <div
                  class="barra-progreso"
                  [class.barra-color-1]="idx % 3 === 0"
                  [class.barra-color-2]="idx % 3 === 1"
                  [class.barra-color-3]="idx % 3 === 2"
                  [style.width.%]="calcularPorcentaje(item.valor)"
                ></div>
              </div>
              @if (item.subtitulo) {
                <span class="barra-subtitulo">{{ item.subtitulo }}</span>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .grafico-container {
        background: var(--bg-card, #fbf8f2);
        border: var(--border-width, 2px) solid var(--border, #272321);
        border-radius: var(--radius-md, 5px);
        box-shadow: var(--shadow-sm, 0 2px 0 #272321);
        padding: 1.25rem;
      }
      .grafico-titulo {
        font-family: var(--font-display, sans-serif);
        font-size: 1.25rem;
        letter-spacing: 0.05em;
        margin-bottom: 1rem;
        color: var(--text-main, #272321);
        border-bottom: 1px solid var(--border-muted, #d1c3ad);
        padding-bottom: 0.5rem;
      }
      .grafico-vacio {
        text-align: center;
        padding: 2.5rem 1rem;
        color: var(--text-muted, #524b46);
        font-family: var(--font-mono, monospace);
        font-size: 0.85rem;
      }
      .barras-lista {
        display: flex;
        flex-direction: column;
        gap: 0.9rem;
      }
      .barra-item {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      .barra-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.875rem;
        font-weight: 600;
      }
      .barra-etiqueta {
        font-family: var(--font-mono, monospace);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 70%;
      }
      .barra-valor {
        font-family: var(--font-display, sans-serif);
        font-size: 1.15rem;
        color: var(--primary, #b8383b);
      }
      .barra-fondo {
        height: 14px;
        background: #e5ded3;
        border: 1px solid var(--border, #272321);
        border-radius: 2px;
        overflow: hidden;
      }
      .barra-progreso {
        height: 100%;
        transition: width 0.4s ease;
      }
      .barra-color-1 {
        background: var(--tf-red, #b8383b);
      }
      .barra-color-2 {
        background: var(--tf-blu, #5b7a8c);
      }
      .barra-color-3 {
        background: var(--tf-amber, #de9538);
      }
      .barra-subtitulo {
        font-size: 0.75rem;
        color: var(--text-muted, #524b46);
      }
    `,
  ],
})
export class GraficoBarrasComponent {
  @Input() titulo = '';
  @Input() datos: DatoBarra[] = [];

  calcularPorcentaje(valor: number): number {
    if (!this.datos || this.datos.length === 0) return 0;
    const max = Math.max(...this.datos.map((d) => d.valor), 1);
    return Math.min(100, Math.max(8, Math.round((valor / max) * 100)));
  }
}
