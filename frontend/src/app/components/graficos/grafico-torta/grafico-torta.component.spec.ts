import { describe, it, expect } from 'vitest';
import { GraficoTortaComponent } from './grafico-torta.component';

describe('GraficoTortaComponent', () => {
  it('debe calcular segmentos y porcentajes correctamente', () => {
    const comp = new GraficoTortaComponent();
    comp.datos = [
      { etiqueta: 'Post 1', valor: 6 },
      { etiqueta: 'Post 2', valor: 4 },
    ];
    comp.ngOnChanges();

    expect(comp.total).toBe(10);
    expect(comp.segmentos).toHaveLength(2);
    expect(comp.segmentos[0].porcentaje).toBe(60);
    expect(comp.segmentos[1].porcentaje).toBe(40);
  });

  it('debe manejar datos vacíos sin errores', () => {
    const comp = new GraficoTortaComponent();
    comp.datos = [];
    comp.ngOnChanges();

    expect(comp.total).toBe(0);
    expect(comp.segmentos).toHaveLength(0);
  });
});
