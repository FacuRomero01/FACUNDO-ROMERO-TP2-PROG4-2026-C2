import { describe, it, expect } from 'vitest';
import { GraficoBarrasComponent } from './grafico-barras.component';

describe('GraficoBarrasComponent', () => {
  it('debe calcular el porcentaje correctamente', () => {
    const comp = new GraficoBarrasComponent();
    comp.datos = [
      { etiqueta: 'user1', valor: 10 },
      { etiqueta: 'user2', valor: 5 },
    ];

    expect(comp.calcularPorcentaje(10)).toBe(100);
    expect(comp.calcularPorcentaje(5)).toBe(50);
  });

  it('debe manejar lista vacia sin dividir por cero', () => {
    const comp = new GraficoBarrasComponent();
    comp.datos = [];
    expect(comp.calcularPorcentaje(5)).toBe(0);
  });
});
