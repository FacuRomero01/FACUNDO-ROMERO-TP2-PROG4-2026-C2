import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  Renderer2,
} from '@angular/core';

@Directive({
  selector: '[appResaltarFila]',
  standalone: true,
})
export class ResaltarFilaDirective {
  @Input() colorResaltado = 'rgba(184, 56, 59, 0.08)'; // Tinte sutil TF2
  private colorOriginal = '';

  constructor(
    private readonly el: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2,
  ) {}

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.colorOriginal = this.el.nativeElement.style.backgroundColor || '';
    this.renderer.setStyle(
      this.el.nativeElement,
      'backgroundColor',
      this.colorResaltado,
    );
    this.renderer.setStyle(
      this.el.nativeElement,
      'transition',
      'background-color 0.2s ease',
    );
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    if (this.colorOriginal) {
      this.renderer.setStyle(
        this.el.nativeElement,
        'backgroundColor',
        this.colorOriginal,
      );
    } else {
      this.renderer.removeStyle(this.el.nativeElement, 'backgroundColor');
    }
  }
}
