import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EstadisticasController } from './estadisticas.controller.js';

describe('EstadisticasController', () => {
  let controller: EstadisticasController;
  let mockPublicacionesService: any;

  beforeEach(() => {
    mockPublicacionesService = {
      obtenerResumenEstadisticas: vi.fn(),
      obtenerEstadisticasPublicacionesPorUsuario: vi.fn(),
      obtenerEstadisticasComentariosPorTiempo: vi.fn(),
      obtenerEstadisticasComentariosPorPublicacion: vi.fn(),
    };

    controller = new EstadisticasController(mockPublicacionesService);
  });

  it('debe obtener el resumen de estadísticas', async () => {
    const mockResumen = {
      publicacionesPorUsuario: [],
      comentariosPorTiempo: [],
      comentariosPorPublicacion: [],
      totales: { totalPublicaciones: 0, totalComentarios: 0 },
    };
    mockPublicacionesService.obtenerResumenEstadisticas.mockResolvedValue(
      mockResumen,
    );

    const resultado = await controller.obtenerResumen({});
    expect(resultado).toEqual(mockResumen);
    expect(
      mockPublicacionesService.obtenerResumenEstadisticas,
    ).toHaveBeenCalledWith({});
  });

  it('debe obtener estadísticas de publicaciones por usuario', async () => {
    const mockDatos = [{ usuarioId: '1', username: 'scout', cantidad: 4 }];
    mockPublicacionesService.obtenerEstadisticasPublicacionesPorUsuario.mockResolvedValue(
      mockDatos,
    );

    const resultado = await controller.publicacionesPorUsuario({
      desde: '2026-01-01',
    });
    expect(resultado).toEqual(mockDatos);
    expect(
      mockPublicacionesService.obtenerEstadisticasPublicacionesPorUsuario,
    ).toHaveBeenCalledWith({ desde: '2026-01-01' });
  });

  it('debe obtener estadísticas de comentarios en el tiempo', async () => {
    const mockDatos = {
      datos: [{ fecha: '2026-11-01', cantidad: 3 }],
      total: 3,
    };
    mockPublicacionesService.obtenerEstadisticasComentariosPorTiempo.mockResolvedValue(
      mockDatos,
    );

    const resultado = await controller.comentariosPorTiempo({});
    expect(resultado).toEqual(mockDatos);
    expect(
      mockPublicacionesService.obtenerEstadisticasComentariosPorTiempo,
    ).toHaveBeenCalled();
  });

  it('debe obtener estadísticas de comentarios por publicación', async () => {
    const mockDatos = [{ publicacionId: 'p1', titulo: 'Alerta', cantidad: 5 }];
    mockPublicacionesService.obtenerEstadisticasComentariosPorPublicacion.mockResolvedValue(
      mockDatos,
    );

    const resultado = await controller.comentariosPorPublicacion({});
    expect(resultado).toEqual(mockDatos);
    expect(
      mockPublicacionesService.obtenerEstadisticasComentariosPorPublicacion,
    ).toHaveBeenCalled();
  });
});
