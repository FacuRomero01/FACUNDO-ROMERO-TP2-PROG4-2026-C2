import { describe, it, expect } from 'vitest';
import { GraficoLineasComponent } from './grafico-lineas.component';

describe('GraficoLineasComponent', () => {
  it('debe calcular coordenadas de línea y puntos cuando hay datos', () => {
    const comp = new GraficoLineasComponent();
    comp.datos = [
      { etiqueta: '2026-11-01', valor: 2 },
      { etiqueta: '2026-11-02', valor: 6 },
    ];
    comp.ngOnChanges();

    expect(comp.puntos).toHaveLength(2);
    expect(comp.lineaD).toContain('M');
    expect(comp.lineaD).toContain('L');
    expect(comp.areaD).toContain('Z');
  });

  it('debe abreviar fechas en formato ISO', () => {
    const comp = new GraficoLineasComponent();
    expect(comp.formatearEtiquetaCorta('2026-11-18')).toBe('18/11');
  });
});
