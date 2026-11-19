import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DatoLinea {
  etiqueta: string;
  valor: number;
}

interface PuntoCalculado {
  x: number;
  y: number;
  etiqueta: string;
  valor: number;
}

@Component({
  selector: 'app-grafico-lineas',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grafico-container">
      @if (titulo) {
        <h4 class="grafico-titulo">{{ titulo }}</h4>
      }

      @if (!datos || datos.length === 0) {
        <div class="grafico-vacio">
          <p>NO SE REGISTRAN COMENTARIOS EN EL PERÍODO SELECCIONADO</p>
        </div>
      } @else {
        <div class="svg-wrapper">
          <svg
            viewBox="0 0 500 220"
            class="linea-svg"
            preserveAspectRatio="none"
          >
            <!-- Grilla horizontal -->
            <line x1="40" y1="30" x2="480" y2="30" stroke="#d1c3ad" stroke-dasharray="3,3" />
            <line x1="40" y1="95" x2="480" y2="95" stroke="#d1c3ad" stroke-dasharray="3,3" />
            <line x1="40" y1="160" x2="480" y2="160" stroke="#d1c3ad" />

            <!-- Ejes -->
            <line x1="40" y1="20" x2="40" y2="160" stroke="#272321" stroke-width="2" />
            <line x1="40" y1="160" x2="480" y2="160" stroke="#272321" stroke-width="2" />

            <!-- Área sombreada bajo la curva -->
            @if (areaD) {
              <path [attr.d]="areaD" fill="rgba(91, 122, 140, 0.18)" />
            }

            <!-- Línea de datos -->
            @if (lineaD) {
              <path
                [attr.d]="lineaD"
                fill="none"
                stroke="#5b7a8c"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            }

            <!-- Puntos -->
            @for (pt of puntos; track pt.etiqueta) {
              <circle
                [attr.cx]="pt.x"
                [attr.cy]="pt.y"
                r="5"
                fill="#b8383b"
                stroke="#272321"
                stroke-width="2"
              />
              <text
                [attr.x]="pt.x"
                [attr.y]="pt.y - 10"
                font-family="Space Mono, monospace"
                font-size="11"
                font-weight="bold"
                fill="#272321"
                text-anchor="middle"
              >
                {{ pt.valor }}
              </text>
            }

            <!-- Etiquetas del eje X -->
            @for (pt of puntos; track pt.etiqueta) {
              <text
                [attr.x]="pt.x"
                y="185"
                font-family="Space Mono, monospace"
                font-size="9"
                fill="#524b46"
                text-anchor="middle"
              >
                {{ formatearEtiquetaCorta(pt.etiqueta) }}
              </text>
            }
          </svg>
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
      .svg-wrapper {
        width: 100%;
        overflow-x: auto;
      }
      .linea-svg {
        width: 100%;
        height: auto;
        min-height: 200px;
        display: block;
      }
    `,
  ],
})
export class GraficoLineasComponent implements OnChanges {
  @Input() titulo = '';
  @Input() datos: DatoLinea[] = [];

  lineaD = '';
  areaD = '';
  puntos: PuntoCalculado[] = [];

  ngOnChanges(): void {
    this.calcularGrafico();
  }

  private calcularGrafico(): void {
    if (!this.datos || this.datos.length === 0) {
      this.lineaD = '';
      this.areaD = '';
      this.puntos = [];
      return;
    }

    const paddingX = 50;
    const paddingRight = 30;
    const anchoUtil = 500 - paddingX - paddingRight;
    const yBase = 160;
    const yTop = 35;
    const alturaUtil = yBase - yTop;

    const maxValor = Math.max(...this.datos.map((d) => d.valor), 1);
    const pasoX =
      this.datos.length > 1 ? anchoUtil / (this.datos.length - 1) : anchoUtil / 2;

    this.puntos = this.datos.map((item, index) => {
      const x =
        this.datos.length === 1
          ? paddingX + anchoUtil / 2
          : paddingX + index * pasoX;
      const y = yBase - (item.valor / maxValor) * alturaUtil;
      return {
        x: Math.round(x),
        y: Math.round(y),
        etiqueta: item.etiqueta,
        valor: item.valor,
      };
    });

    if (this.puntos.length === 1) {
      const p = this.puntos[0];
      this.lineaD = `M ${p.x - 20} ${p.y} L ${p.x + 20} ${p.y}`;
      this.areaD = `M ${p.x - 20} ${p.y} L ${p.x + 20} ${p.y} L ${p.x + 20} ${yBase} L ${p.x - 20} ${yBase} Z`;
    } else {
      this.lineaD = this.puntos.reduce(
        (acc, p, idx) => (idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
        '',
      );
      const primerPunto = this.puntos[0];
      const ultimoPunto = this.puntos[this.puntos.length - 1];
      this.areaD = `${this.lineaD} L ${ultimoPunto.x} ${yBase} L ${primerPunto.x} ${yBase} Z`;
    }
  }

  formatearEtiquetaCorta(etiqueta: string): string {
    if (etiqueta.includes('-')) {
      const partes = etiqueta.split('-');
      if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}`;
      }
    }
    return etiqueta;
  }
}
