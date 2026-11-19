import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  Renderer2,
} from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  standalone: true,
})
export class TooltipDirective {
  @Input('appTooltip') textoTooltip = '';

  private elementoTooltip: HTMLElement | null = null;

  constructor(
    private readonly el: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2,
  ) {}

  @HostListener('mouseenter')
  @HostListener('focus')
  mostrar(): void {
    if (!this.textoTooltip || this.elementoTooltip) return;

    this.elementoTooltip = this.renderer.createElement('span');
    const texto = this.renderer.createText(this.textoTooltip);
    this.renderer.appendChild(this.elementoTooltip, texto);

    this.renderer.setStyle(this.elementoTooltip, 'position', 'absolute');
    this.renderer.setStyle(this.elementoTooltip, 'bottom', '125%');
    this.renderer.setStyle(this.elementoTooltip, 'left', '50%');
    this.renderer.setStyle(this.elementoTooltip, 'transform', 'translateX(-50%)');
    this.renderer.setStyle(this.elementoTooltip, 'backgroundColor', '#272321');
    this.renderer.setStyle(this.elementoTooltip, 'color', '#fbf8f2');
    this.renderer.setStyle(this.elementoTooltip, 'padding', '4px 8px');
    this.renderer.setStyle(this.elementoTooltip, 'borderRadius', '3px');
    this.renderer.setStyle(this.elementoTooltip, 'fontSize', '11px');
    this.renderer.setStyle(this.elementoTooltip, 'fontFamily', 'var(--font-mono, monospace)');
    this.renderer.setStyle(this.elementoTooltip, 'whiteSpace', 'nowrap');
    this.renderer.setStyle(this.elementoTooltip, 'zIndex', '1000');
    this.renderer.setStyle(this.elementoTooltip, 'pointerEvents', 'none');
    this.renderer.setStyle(this.elementoTooltip, 'boxShadow', '0 2px 4px rgba(0,0,0,0.2)');

    this.renderer.setStyle(this.el.nativeElement, 'position', 'relative');
    this.renderer.appendChild(this.el.nativeElement, this.elementoTooltip);
  }

  @HostListener('mouseleave')
  @HostListener('blur')
  ocultar(): void {
    if (this.elementoTooltip) {
      this.renderer.removeChild(this.el.nativeElement, this.elementoTooltip);
      this.elementoTooltip = null;
    }
  }
}
