import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { PublicacionesService } from './publicaciones.service.js';
import { CrearComentarioDto } from './dto/crear-comentario.dto.js';
import { EditarComentarioDto } from './dto/editar-comentario.dto.js';
import { FiltrarComentariosDto } from './dto/filtrar-comentarios.dto.js';

@Controller()
@UseGuards(JwtAuthGuard)
export class ComentariosController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  @Post(['publicaciones/:publicacionId/comentarios', 'publicaciones/:publicacionId/comentar'])
  @HttpCode(HttpStatus.CREATED)
  async agregarComentario(
    @Param('publicacionId') publicacionId: string,
    @Body() dto: CrearComentarioDto,
    @Request() req: any,
  ) {
    const usuarioId = req.user._id?.toString() || req.user.id || req.user.sub;
    return this.publicacionesService.crearComentario(
      publicacionId,
      usuarioId,
      dto,
    );
  }

  @Get('publicaciones/:publicacionId/comentarios')
  @HttpCode(HttpStatus.OK)
  async listarComentarios(
    @Param('publicacionId') publicacionId: string,
    @Query() filtros: FiltrarComentariosDto,
  ) {
    return this.publicacionesService.listarComentarios(publicacionId, filtros);
  }

  @Put('publicaciones/:publicacionId/comentarios/:comentarioId')
  @HttpCode(HttpStatus.OK)
  async modificarComentarioEnPublicacion(
    @Param('publicacionId') publicacionId: string,
    @Param('comentarioId') comentarioId: string,
    @Body() dto: EditarComentarioDto,
    @Request() req: any,
  ) {
    const usuarioId = req.user._id?.toString() || req.user.id || req.user.sub;
    return this.publicacionesService.editarComentario(
      publicacionId,
      comentarioId,
      usuarioId,
      dto,
    );
  }

  @Put('comentarios/:comentarioId')
  @HttpCode(HttpStatus.OK)
  async modificarComentarioDirecto(
    @Param('comentarioId') comentarioId: string,
    @Body() dto: EditarComentarioDto,
    @Request() req: any,
  ) {
    const usuarioId = req.user._id?.toString() || req.user.id || req.user.sub;
    return this.publicacionesService.editarComentario(
      undefined,
      comentarioId,
      usuarioId,
      dto,
    );
  }
}
