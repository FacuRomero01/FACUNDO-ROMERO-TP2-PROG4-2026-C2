import { describe, it, expect } from 'vitest';
import { ElementRef } from '@angular/core';
import { ImagenFallbackDirective } from './imagen-fallback.directive';

describe('ImagenFallbackDirective', () => {
  it('debe reemplazar src cuando se dispara onError', () => {
    const mockImg = { src: 'http://invalido.jpg' } as HTMLImageElement;
    const ref = new ElementRef<HTMLImageElement>(mockImg);
    const directive = new ImagenFallbackDirective(ref);

    directive.onError();
    expect(mockImg.src).toContain('data:image/svg+xml');
  });

  it('debe usar fallback personalizado si se suministra', () => {
    const mockImg = { src: 'http://invalido.jpg' } as HTMLImageElement;
    const ref = new ElementRef<HTMLImageElement>(mockImg);
    const directive = new ImagenFallbackDirective(ref);
    directive.appImagenFallback = '/custom-avatar.png';

    directive.onError();
    expect(mockImg.src).toBe('/custom-avatar.png');
  });
});
