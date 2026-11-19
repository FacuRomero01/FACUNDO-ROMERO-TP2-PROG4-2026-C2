import { describe, it, expect, vi } from 'vitest';
import { ElementRef, Renderer2 } from '@angular/core';
import { ResaltarFilaDirective } from './resaltar-fila.directive';

describe('ResaltarFilaDirective', () => {
  it('debe cambiar y restaurar el color de fondo en mouseenter y mouseleave', () => {
    const mockElement = {
      style: { backgroundColor: '' },
    } as any;
    const ref = new ElementRef<HTMLElement>(mockElement);
    const mockRenderer: Renderer2 = {
      setStyle: vi.fn(),
      removeStyle: vi.fn(),
    } as any;

    const directive = new ResaltarFilaDirective(ref, mockRenderer);
    directive.onMouseEnter();

    expect(mockRenderer.setStyle).toHaveBeenCalledWith(
      mockElement,
      'backgroundColor',
      'rgba(184, 56, 59, 0.08)',
    );

    directive.onMouseLeave();
    expect(mockRenderer.removeStyle).toHaveBeenCalledWith(
      mockElement,
      'backgroundColor',
    );
  });
});
