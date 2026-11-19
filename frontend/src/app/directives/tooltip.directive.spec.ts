import { describe, it, expect, vi } from 'vitest';
import { ElementRef, Renderer2 } from '@angular/core';
import { TooltipDirective } from './tooltip.directive';

describe('TooltipDirective', () => {
  it('debe crear y remover el tooltip al mostrar y ocultar', () => {
    const mockElement = {} as HTMLElement;
    const ref = new ElementRef<HTMLElement>(mockElement);
    const mockCreatedSpan = {} as HTMLElement;
    const mockRenderer: Renderer2 = {
      createElement: vi.fn().mockReturnValue(mockCreatedSpan),
      createText: vi.fn(),
      appendChild: vi.fn(),
      removeChild: vi.fn(),
      setStyle: vi.fn(),
    } as any;

    const directive = new TooltipDirective(ref, mockRenderer);
    directive.textoTooltip = 'Ayuda clasificada';

    directive.mostrar();
    expect(mockRenderer.createElement).toHaveBeenCalledWith('span');
    expect(mockRenderer.appendChild).toHaveBeenCalled();

    directive.ocultar();
    expect(mockRenderer.removeChild).toHaveBeenCalledWith(
      mockElement,
      mockCreatedSpan,
    );
  });
});
