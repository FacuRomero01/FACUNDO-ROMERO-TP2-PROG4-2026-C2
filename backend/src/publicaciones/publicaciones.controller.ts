import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PublicacionesService } from './publicaciones.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';
import { FiltrarPublicacionesDto } from './dto/filtrar-publicaciones.dto.js';
import { opcionesMulterPublicacion } from './utils/multer-publicaciones.config.js';

@Controller('publicaciones')
@UseGuards(JwtAuthGuard)
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('imagen', opcionesMulterPublicacion))
  async crear(
    @Body() crearPublicacionDto: CrearPublicacionDto,
    @UploadedFile() archivo: Express.Multer.File,
    @Request() req: any,
  ) {
    const usuarioId = req.user._id?.toString() || req.user.id;
    return this.publicacionesService.crearPublicacion(
      crearPublicacionDto,
      usuarioId,
      archivo,
    );
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async listar(@Query() filtros: FiltrarPublicacionesDto) {
    return this.publicacionesService.listarPublicaciones(filtros);
  }

  @Get('usuario/:usuarioId/ultimas')
  @HttpCode(HttpStatus.OK)
  async obtenerUltimasPorUsuario(
    @Param('usuarioId') usuarioId: string,
    @Query('cantidad') cantidad?: string,
  ) {
    const limite = cantidad ? parseInt(cantidad, 10) : 3;
    return this.publicacionesService.obtenerUltimasPorUsuario(usuarioId, limite);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async buscarPorId(@Param('id') id: string) {
    return this.publicacionesService.buscarPorId(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async eliminar(@Param('id') id: string, @Request() req: any) {
    const usuarioId = req.user._id?.toString() || req.user.id;
    const rolUsuario = req.user.perfil;
    return this.publicacionesService.eliminarPublicacion(
      id,
      usuarioId,
      rolUsuario,
    );
  }

  @Post(':id/me-gusta')
  @HttpCode(HttpStatus.OK)
  async darMeGusta(@Param('id') id: string, @Request() req: any) {
    const usuarioId = req.user._id?.toString() || req.user.id;
    return this.publicacionesService.darMeGusta(id, usuarioId);
  }

  @Post(':id/like')
  @HttpCode(HttpStatus.OK)
  async darMeGustaAlias(@Param('id') id: string, @Request() req: any) {
    const usuarioId = req.user._id?.toString() || req.user.id;
    return this.publicacionesService.darMeGusta(id, usuarioId);
  }

  @Delete(':id/me-gusta')
  @HttpCode(HttpStatus.OK)
  async quitarMeGusta(@Param('id') id: string, @Request() req: any) {
    const usuarioId = req.user._id?.toString() || req.user.id;
    return this.publicacionesService.quitarMeGusta(id, usuarioId);
  }

  @Delete(':id/like')
  @HttpCode(HttpStatus.OK)
  async quitarMeGustaAlias(@Param('id') id: string, @Request() req: any) {
    const usuarioId = req.user._id?.toString() || req.user.id;
    return this.publicacionesService.quitarMeGusta(id, usuarioId);
  }
}
