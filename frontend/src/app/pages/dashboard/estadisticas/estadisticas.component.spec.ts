import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { EstadisticasComponent } from './estadisticas.component';
import { EstadisticasService } from '../../../services/estadisticas.service';
import { ToastService } from '../../../services/toast.service';
import { provideRouter } from '@angular/router';

describe('EstadisticasComponent', () => {
  let component: EstadisticasComponent;
  let mockEstadisticasService: any;
  let mockToastService: any;

  beforeEach(() => {
    mockEstadisticasService = {
      obtenerResumen: vi.fn().mockReturnValue(
        of({
          publicacionesPorUsuario: [
            {
              usuarioId: '1',
              username: 'medic',
              nombreCompleto: 'Dr. Ludwig',
              cantidad: 8,
            },
          ],
          comentariosPorTiempo: [{ fecha: '2026-11-18', cantidad: 12 }],
          totalComentarios: 12,
          comentariosPorPublicacion: [
            { publicacionId: 'p1', titulo: 'Supervivencia', cantidad: 7 },
          ],
          totales: {
            totalPublicaciones: 8,
            totalComentarios: 12,
          },
        }),
      ),
    };
    mockToastService = {
      error: vi.fn(),
    };

    TestBed.configureTestingModule({
      imports: [EstadisticasComponent],
      providers: [
        provideRouter([]),
        { provide: EstadisticasService, useValue: mockEstadisticasService },
        { provide: ToastService, useValue: mockToastService },
      ],
    });

    const fixture = TestBed.createComponent(EstadisticasComponent);
    component = fixture.componentInstance;
  });

  it('debe inicializarse y cargar los datos de las 3 métricas', () => {
    component.ngOnInit();

    expect(component.resumen()).not.toBeNull();
    expect(component.datosBarras()).toHaveLength(1);
    expect(component.datosBarras()[0].etiqueta).toBe('@medic');
    expect(component.datosLineas()).toHaveLength(1);
    expect(component.datosTorta()).toHaveLength(1);
    expect(component.estaCargando()).toBe(false);
  });

  it('debe permitir aplicar filtros rápidos', () => {
    component.aplicarFiltroRapido('7d');
    expect(component.filtroSeleccionado()).toBe('7d');
    expect(mockEstadisticasService.obtenerResumen).toHaveBeenCalled();
  });

  it('debe validar que fecha desde no sea posterior a fecha hasta', () => {
    component.fechaDesde = '2026-12-01';
    component.fechaHasta = '2026-11-01';
    component.aplicarRangoPersonalizado();

    expect(mockToastService.error).toHaveBeenCalled();
  });
});
