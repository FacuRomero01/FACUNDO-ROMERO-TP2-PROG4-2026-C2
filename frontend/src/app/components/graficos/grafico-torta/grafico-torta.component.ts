import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DatoTorta {
  etiqueta: string;
  valor: number;
}

interface SegmentoCalculado {
  etiqueta: string;
  valor: number;
  porcentaje: number;
  color: string;
  dashArray: string;
  dashOffset: number;
}

@Component({
  selector: 'app-grafico-torta',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grafico-container">
      @if (titulo) {
        <h4 class="grafico-titulo">{{ titulo }}</h4>
      }

      @if (!datos || datos.length === 0 || total === 0) {
        <div class="grafico-vacio">
          <p>NO SE REGISTRAN DATOS PARA EL DIAGRAMA DE DISTRIBUCIÓN</p>
        </div>
      } @else {
        <div class="torta-cuerpo">
          <div class="svg-container">
            <svg viewBox="0 0 200 200" class="donut-svg">
              <g transform="rotate(-90 100 100)">
                <!-- Fondo base del donut -->
                <circle
                  cx="100"
                  cy="100"
                  r="70"
                  fill="transparent"
                  stroke="#e5ded3"
                  stroke-width="32"
                />
                <!-- Segmentos coloreados -->
                @for (seg of segmentos; track seg.etiqueta) {
                  <circle
                    cx="100"
                    cy="100"
                    r="70"
                    fill="transparent"
                    [attr.stroke]="seg.color"
                    stroke-width="32"
                    [attr.stroke-dasharray]="seg.dashArray"
                    [attr.stroke-dashoffset]="seg.dashOffset"
                    class="segmento-donut"
                  />
                }
              </g>
              <!-- Centro informativo del donut -->
              <text
                x="100"
                y="95"
                text-anchor="middle"
                font-family="Bebas Neue, sans-serif"
                font-size="28"
                fill="#272321"
              >
                {{ total }}
              </text>
              <text
                x="100"
                y="115"
                text-anchor="middle"
                font-family="Space Mono, monospace"
                font-size="9"
                fill="#524b46"
              >
                COMENTARIOS
              </text>
            </svg>
          </div>

          <!-- Leyenda descriptiva al costado -->
          <div class="leyenda-lista">
            @for (seg of segmentos; track seg.etiqueta) {
              <div class="leyenda-item">
                <span class="punto-color" [style.backgroundColor]="seg.color"></span>
                <span class="leyenda-texto" [title]="seg.etiqueta">
                  {{ seg.etiqueta }}
                </span>
                <span class="leyenda-conteo">{{ seg.valor }}</span>
                <span class="leyenda-porc">({{ seg.porcentaje }}%)</span>
              </div>
            }
          </div>
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
      .torta-cuerpo {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.25rem;
      }
      @media (min-width: 640px) {
        .torta-cuerpo {
          flex-direction: row;
          justify-content: space-around;
        }
      }
      .svg-container {
        width: 170px;
        height: 170px;
        flex-shrink: 0;
      }
      .donut-svg {
        width: 100%;
        height: 100%;
      }
      .segmento-donut {
        transition: stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease;
      }
      .leyenda-lista {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        max-width: 100%;
        overflow-y: auto;
        max-height: 220px;
        padding-right: 0.5rem;
      }
      .leyenda-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.85rem;
      }
      .punto-color {
        width: 12px;
        height: 12px;
        border-radius: 2px;
        border: 1px solid #272321;
        flex-shrink: 0;
      }
      .leyenda-texto {
        font-family: var(--font-mono, monospace);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 160px;
      }
      .leyenda-conteo {
        font-weight: 700;
        margin-left: auto;
      }
      .leyenda-porc {
        font-family: var(--font-mono, monospace);
        font-size: 0.75rem;
        color: var(--text-muted, #524b46);
      }
    `,
  ],
})
export class GraficoTortaComponent implements OnChanges {
  @Input() titulo = '';
  @Input() datos: DatoTorta[] = [];

  readonly paletaColores = [
    '#b8383b', // TF2 Red
    '#5b7a8c', // TF2 Blu
    '#de9538', // Amber
    '#4a7c43', // Green
    '#7c736c', // Metal Gray
    '#8c2424', // Red Dark
    '#3b515e', // Blu Dark
  ];

  readonly circunferencia = 2 * Math.PI * 70; // ~439.82
  total = 0;
  segmentos: SegmentoCalculado[] = [];

  ngOnChanges(): void {
    this.calcularSegmentos();
  }

  private calcularSegmentos(): void {
    if (!this.datos || this.datos.length === 0) {
      this.segmentos = [];
      this.total = 0;
      return;
    }

    this.total = this.datos.reduce((acc, d) => acc + d.valor, 0);
    if (this.total === 0) {
      this.segmentos = [];
      return;
    }

    let offsetAcumulado = 0;

    this.segmentos = this.datos.map((item, idx) => {
      const porcentaje = Math.round((item.valor / this.total) * 100);
      const longitudArco = (item.valor / this.total) * this.circunferencia;
      const dashArray = `${longitudArco} ${this.circunferencia - longitudArco}`;
      const dashOffset = -offsetAcumulado;

      offsetAcumulado += longitudArco;

      return {
        etiqueta: item.etiqueta,
        valor: item.valor,
        porcentaje,
        color: this.paletaColores[idx % this.paletaColores.length],
        dashArray,
        dashOffset,
      };
    });
  }
}
