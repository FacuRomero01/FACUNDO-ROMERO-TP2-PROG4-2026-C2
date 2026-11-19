import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: 'img[appImagenFallback]',
  standalone: true,
})
export class ImagenFallbackDirective {
  @Input() appImagenFallback?: string;

  private yaFallo = false;
  private readonly fallbackPredeterminado =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="%23c7bcad"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>';

  constructor(private readonly el: ElementRef<HTMLImageElement>) {}

  @HostListener('error')
  onError(): void {
    if (!this.yaFallo) {
      this.yaFallo = true;
      this.el.nativeElement.src =
        this.appImagenFallback || this.fallbackPredeterminado;
    }
  }
}
