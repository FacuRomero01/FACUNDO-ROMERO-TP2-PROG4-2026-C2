import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Publicacion,
  PublicacionSchema,
} from './schemas/publicacion.schema.js';
import { PublicacionesService } from './publicaciones.service.js';
import { PublicacionesController } from './publicaciones.controller.js';
import { ComentariosController } from './comentarios.controller.js';
import { EstadisticasController } from './estadisticas.controller.js';
import { AuthModule } from '../auth/auth.module.js';
import { ArchivosModule } from '../archivos/archivos.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Publicacion.name, schema: PublicacionSchema },
    ]),
    AuthModule,
    ArchivosModule,
  ],
  controllers: [
    PublicacionesController,
    ComentariosController,
    EstadisticasController,
  ],
  providers: [PublicacionesService],
  exports: [PublicacionesService, MongooseModule],
})
export class PublicacionesModule {}
