import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AdminGuard } from '../auth/guards/admin.guard.js';
import { PublicacionesService } from './publicaciones.service.js';
import { FiltrarEstadisticasDto } from './dto/filtrar-estadisticas.dto.js';

@Controller(['estadisticas', 'publicaciones/estadisticas'])
@UseGuards(JwtAuthGuard, AdminGuard)
export class EstadisticasController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  @Get(['resumen', ''])
  @HttpCode(HttpStatus.OK)
  async obtenerResumen(@Query() dto: FiltrarEstadisticasDto) {
    return this.publicacionesService.obtenerResumenEstadisticas(dto);
  }

  @Get('publicaciones-por-usuario')
  @HttpCode(HttpStatus.OK)
  async publicacionesPorUsuario(@Query() dto: FiltrarEstadisticasDto) {
    return this.publicacionesService.obtenerEstadisticasPublicacionesPorUsuario(
      dto,
    );
  }

  @Get('comentarios-por-tiempo')
  @HttpCode(HttpStatus.OK)
  async comentariosPorTiempo(@Query() dto: FiltrarEstadisticasDto) {
    return this.publicacionesService.obtenerEstadisticasComentariosPorTiempo(
      dto,
    );
  }

  @Get('comentarios-por-publicacion')
  @HttpCode(HttpStatus.OK)
  async comentariosPorPublicacion(@Query() dto: FiltrarEstadisticasDto) {
    return this.publicacionesService.obtenerEstadisticasComentariosPorPublicacion(
      dto,
    );
  }
}
