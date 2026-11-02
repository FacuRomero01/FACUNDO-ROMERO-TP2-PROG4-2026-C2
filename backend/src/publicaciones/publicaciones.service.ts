import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Publicacion,
  PublicacionDocument,
} from './schemas/publicacion.schema.js';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';
import { FiltrarPublicacionesDto } from './dto/filtrar-publicaciones.dto.js';
import { ArchivosService } from '../archivos/archivos.service.js';

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name)
    private readonly publicacionModel: Model<PublicacionDocument>,
    @Optional() private readonly archivosService?: ArchivosService,
  ) {}

  async crearPublicacion(
    datosPublicacion: CrearPublicacionDto,
    usuarioId: string,
    archivoImagen?: Express.Multer.File,
  ): Promise<PublicacionDocument> {
    let imagenUrl: string | null = datosPublicacion.imagenUrl || null;

    if (archivoImagen) {
      const rutaLocal = `/uploads/publicaciones/${archivoImagen.filename}`;
      imagenUrl = this.archivosService
        ? await this.archivosService.subirImagen(
            archivoImagen,
            'publicaciones',
            rutaLocal,
          )
        : rutaLocal;
    }

    const nuevaPublicacion = new this.publicacionModel({
      titulo: datosPublicacion.titulo.trim(),
      descripcion: datosPublicacion.descripcion.trim(),
      imagenUrl,
      autor: new Types.ObjectId(usuarioId),
      meGusta: [],
      comentarios: [],
      activo: true,
    });

    const guardada = await nuevaPublicacion.save();
    return this.publicacionModel
      .findById(guardada._id)
      .populate('autor', 'nombre apellido username fotoPerfil perfil')
      .exec() as Promise<PublicacionDocument>;
  }

  async listarPublicaciones(filtros: FiltrarPublicacionesDto) {
    const offset = filtros.offset ?? 0;
    const limit = filtros.limit ?? 10;
    const ordenSolicitado = filtros.orden || filtros.sort || 'fecha';
    const identificadorAutor = filtros.autor || filtros.usuarioId;

    const criterioFiltro: Record<string, any> = { activo: true };

    if (identificadorAutor) {
      if (!Types.ObjectId.isValid(identificadorAutor)) {
        return {
          publicaciones: [],
          total: 0,
          offset,
          limit,
        };
      }
      criterioFiltro.autor = new Types.ObjectId(identificadorAutor);
    }

    const total = await this.publicacionModel.countDocuments(criterioFiltro).exec();

    const ordenarPorMeGusta =
      ordenSolicitado === 'meGusta' ||
      ordenSolicitado === 'likes' ||
      ordenSolicitado === 'popular';

    if (ordenarPorMeGusta) {
      const idsOrdenados = await this.publicacionModel.aggregate([
        { $match: criterioFiltro },
        {
          $addFields: {
            cantidadMeGusta: { $size: { $ifNull: ['$meGusta', []] } },
          },
        },
        { $sort: { cantidadMeGusta: -1, createdAt: -1 } },
        { $skip: offset },
        { $limit: limit },
        { $project: { _id: 1 } },
      ]);

      const listaIds = idsOrdenados.map((item) => item._id);

      const publicacionesEncontradas = await this.publicacionModel
        .find({ _id: { $in: listaIds } })
        .populate('autor', 'nombre apellido username fotoPerfil perfil')
        .populate('comentarios.autor', 'nombre apellido username fotoPerfil')
        .exec();

      const mapaPublicaciones = new Map(
        publicacionesEncontradas.map((pub) => [pub._id.toString(), pub]),
      );

      const publicacionesOrdenadas = listaIds
        .map((id) => mapaPublicaciones.get(id.toString()))
        .filter((pub): pub is NonNullable<typeof pub> => Boolean(pub));

      return {
        publicaciones: publicacionesOrdenadas,
        total,
        offset,
        limit,
      };
    }

    const publicaciones = await this.publicacionModel
      .find(criterioFiltro)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .populate('autor', 'nombre apellido username fotoPerfil perfil')
      .populate('comentarios.autor', 'nombre apellido username fotoPerfil')
      .exec();

    return {
      publicaciones,
      total,
      offset,
      limit,
    };
  }

  async buscarPorId(publicacionId: string): Promise<PublicacionDocument> {
    if (!Types.ObjectId.isValid(publicacionId)) {
      throw new NotFoundException('Publicación no encontrada');
    }

    const publicacion = await this.publicacionModel
      .findOne({ _id: publicacionId, activo: true })
      .populate('autor', 'nombre apellido username fotoPerfil perfil')
      .populate('comentarios.autor', 'nombre apellido username fotoPerfil')
      .exec();

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }

    return publicacion;
  }

  async eliminarPublicacion(
    publicacionId: string,
    usuarioId: string,
    rolUsuario: string,
  ): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(publicacionId)) {
      throw new NotFoundException('Publicación no encontrada');
    }

    const publicacion = await this.publicacionModel
      .findOne({ _id: publicacionId, activo: true })
      .exec();

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }

    const autorIdString =
      publicacion.autor instanceof Types.ObjectId
        ? publicacion.autor.toString()
        : (publicacion.autor as any)?._id?.toString() ||
          publicacion.autor.toString();

    const esAutor = autorIdString === usuarioId;
    const esAdministrador = rolUsuario === 'administrador';

    if (!esAutor && !esAdministrador) {
      throw new ForbiddenException(
        'No posee los permisos requeridos para dar de baja esta publicación',
      );
    }

    // Baja lógica
    publicacion.activo = false;
    await publicacion.save();

    return { message: 'Publicación dada de baja exitosamente' };
  }

  async darMeGusta(
    publicacionId: string,
    usuarioId: string,
  ): Promise<PublicacionDocument> {
    if (!Types.ObjectId.isValid(publicacionId)) {
      throw new NotFoundException('Publicación no encontrada');
    }

    const publicacion = await this.publicacionModel
      .findOne({ _id: publicacionId, activo: true })
      .exec();

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }

    const yaDioMeGusta = publicacion.meGusta.some(
      (idExistente) => idExistente.toString() === usuarioId,
    );

    if (yaDioMeGusta) {
      throw new BadRequestException(
        'El usuario ya ha registrado un me gusta en esta publicación',
      );
    }

    publicacion.meGusta.push(new Types.ObjectId(usuarioId));
    await publicacion.save();

    return this.buscarPorId(publicacionId);
  }

  async quitarMeGusta(
    publicacionId: string,
    usuarioId: string,
  ): Promise<PublicacionDocument> {
    if (!Types.ObjectId.isValid(publicacionId)) {
      throw new NotFoundException('Publicación no encontrada');
    }

    const publicacion = await this.publicacionModel
      .findOne({ _id: publicacionId, activo: true })
      .exec();

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }

    const yaDioMeGusta = publicacion.meGusta.some(
      (idExistente) => idExistente.toString() === usuarioId,
    );

    if (!yaDioMeGusta) {
      throw new BadRequestException(
        'No se puede eliminar el me gusta ya que no fue otorgado previamente por este usuario',
      );
    }

    publicacion.meGusta = publicacion.meGusta.filter(
      (idExistente) => idExistente.toString() !== usuarioId,
    );
    await publicacion.save();

    return this.buscarPorId(publicacionId);
  }

  async obtenerUltimasPorUsuario(
    usuarioId: string,
    cantidad = 3,
  ): Promise<PublicacionDocument[]> {
    if (!Types.ObjectId.isValid(usuarioId)) {
      return [];
    }

    return this.publicacionModel
      .find({ autor: new Types.ObjectId(usuarioId), activo: true })
      .sort({ createdAt: -1 })
      .limit(cantidad)
      .populate('autor', 'nombre apellido username fotoPerfil perfil')
      .populate('comentarios.autor', 'nombre apellido username fotoPerfil')
      .exec();
  }
}
