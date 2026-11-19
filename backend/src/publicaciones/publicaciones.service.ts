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
import { CrearComentarioDto } from './dto/crear-comentario.dto.js';
import { EditarComentarioDto } from './dto/editar-comentario.dto.js';
import { FiltrarComentariosDto } from './dto/filtrar-comentarios.dto.js';
import { FiltrarEstadisticasDto } from './dto/filtrar-estadisticas.dto.js';
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

  async crearComentario(
    publicacionId: string,
    usuarioId: string,
    datosComentario: CrearComentarioDto,
  ) {
    if (!Types.ObjectId.isValid(publicacionId)) {
      throw new NotFoundException('Publicación no encontrada');
    }

    const publicacion = await this.publicacionModel
      .findOne({ _id: publicacionId, activo: true })
      .exec();

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }

    const nuevoId = new Types.ObjectId();
    const nuevoComentario = {
      _id: nuevoId,
      autor: new Types.ObjectId(usuarioId),
      mensaje: datosComentario.mensaje.trim(),
      modificado: false,
      createdAt: new Date(),
    };

    publicacion.comentarios.push(nuevoComentario as any);
    await publicacion.save();

    await publicacion.populate(
      'comentarios.autor',
      'nombre apellido username fotoPerfil perfil',
    );

    const comentarioCreado = publicacion.comentarios.find(
      (c) => c._id?.toString() === nuevoId.toString(),
    );

    return comentarioCreado || nuevoComentario;
  }

  async editarComentario(
    publicacionId: string | undefined,
    comentarioId: string,
    usuarioId: string,
    datosEdicion: EditarComentarioDto,
  ) {
    if (!Types.ObjectId.isValid(comentarioId)) {
      throw new NotFoundException('Comentario no encontrado');
    }

    const query: Record<string, any> = {
      activo: true,
      'comentarios._id': new Types.ObjectId(comentarioId),
    };

    if (publicacionId && Types.ObjectId.isValid(publicacionId)) {
      query._id = new Types.ObjectId(publicacionId);
    }

    const publicacion = await this.publicacionModel
      .findOne(query)
      .populate('comentarios.autor', 'nombre apellido username fotoPerfil perfil')
      .exec();

    if (!publicacion) {
      throw new NotFoundException('Comentario no encontrado');
    }

    const comentario = publicacion.comentarios.find(
      (c) => c._id?.toString() === comentarioId,
    );

    if (!comentario) {
      throw new NotFoundException('Comentario no encontrado');
    }

    const autorId =
      comentario.autor instanceof Types.ObjectId
        ? comentario.autor.toString()
        : (comentario.autor as any)?._id?.toString() ||
          comentario.autor?.toString();

    if (autorId !== usuarioId) {
      throw new ForbiddenException(
        'No posee permisos para editar este comentario',
      );
    }

    comentario.mensaje = datosEdicion.mensaje.trim();
    comentario.modificado = true;

    await publicacion.save();

    return comentario;
  }

  async listarComentarios(
    publicacionId: string,
    filtros: FiltrarComentariosDto,
  ) {
    if (!Types.ObjectId.isValid(publicacionId)) {
      throw new NotFoundException('Publicación no encontrada');
    }

    const publicacion = await this.publicacionModel
      .findOne({ _id: publicacionId, activo: true })
      .populate('comentarios.autor', 'nombre apellido username fotoPerfil perfil')
      .exec();

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }

    const offset = filtros.offset ?? 0;
    const limit = filtros.limit ?? 5;

    // Ordenar los más recientes primero (createdAt descendente)
    const comentariosOrdenados = [...(publicacion.comentarios || [])].sort(
      (a, b) => {
        const tiempoA = new Date(a.createdAt || 0).getTime();
        const tiempoB = new Date(b.createdAt || 0).getTime();
        return tiempoB - tiempoA;
      },
    );

    const total = comentariosOrdenados.length;
    const comentariosPaginados = comentariosOrdenados.slice(
      offset,
      offset + limit,
    );

    return {
      comentarios: comentariosPaginados,
      total,
      offset,
      limit,
    };
  }

  private parsearRangoFechas(dto: FiltrarEstadisticasDto): {
    inicio?: Date;
    fin?: Date;
  } {
    const rawInicio = dto.desde || dto.fechaInicio;
    const rawFin = dto.hasta || dto.fechaFin;

    let inicio: Date | undefined;
    let fin: Date | undefined;

    if (rawInicio) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(rawInicio)) {
        const [anio, mes, dia] = rawInicio.split('-').map(Number);
        const inicioLocal = new Date(anio, mes - 1, dia, 0, 0, 0, 0);
        const inicioUtc = new Date(Date.UTC(anio, mes - 1, dia, 0, 0, 0, 0));
        inicio = new Date(Math.min(inicioLocal.getTime(), inicioUtc.getTime()));
      } else {
        const parsedInicio = new Date(rawInicio);
        if (!isNaN(parsedInicio.getTime())) {
          inicio = parsedInicio;
        }
      }
    }

    if (rawFin) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(rawFin)) {
        const [anio, mes, dia] = rawFin.split('-').map(Number);
        const finLocal = new Date(anio, mes - 1, dia, 23, 59, 59, 999);
        const finUtc = new Date(Date.UTC(anio, mes - 1, dia, 23, 59, 59, 999));
        fin = new Date(Math.max(finLocal.getTime(), finUtc.getTime()));
      } else {
        const parsedFin = new Date(rawFin);
        if (!isNaN(parsedFin.getTime())) {
          if (rawFin.length <= 10) {
            parsedFin.setHours(23, 59, 59, 999);
          }
          fin = parsedFin;
        }
      }
    }

    return { inicio, fin };
  }

  async obtenerEstadisticasPublicacionesPorUsuario(dto: FiltrarEstadisticasDto) {
    const { inicio, fin } = this.parsearRangoFechas(dto);
    const matchFiltro: Record<string, any> = { activo: true };

    if (inicio || fin) {
      matchFiltro.createdAt = {};
      if (inicio) matchFiltro.createdAt.$gte = inicio;
      if (fin) matchFiltro.createdAt.$lte = fin;
    }

    const resultado = await this.publicacionModel.aggregate([
      { $match: matchFiltro },
      {
        $group: {
          _id: '$autor',
          cantidad: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'usuario',
        },
      },
      { $unwind: { path: '$usuario', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          usuarioId: { $toString: '$_id' },
          username: { $ifNull: ['$usuario.username', 'desconocido'] },
          nombreCompleto: {
            $concat: [
              { $ifNull: ['$usuario.nombre', ''] },
              ' ',
              { $ifNull: ['$usuario.apellido', ''] },
            ],
          },
          fotoPerfil: '$usuario.fotoPerfil',
          cantidad: 1,
        },
      },
      { $sort: { cantidad: -1 } },
    ]);

    return resultado;
  }

  async obtenerEstadisticasComentariosPorTiempo(dto: FiltrarEstadisticasDto) {
    const { inicio, fin } = this.parsearRangoFechas(dto);
    const matchComentario: Record<string, any> = {};

    if (inicio || fin) {
      matchComentario['comentarios.createdAt'] = {};
      if (inicio) matchComentario['comentarios.createdAt'].$gte = inicio;
      if (fin) matchComentario['comentarios.createdAt'].$lte = fin;
    }

    const pipeline: any[] = [
      { $match: { activo: true } },
      { $unwind: '$comentarios' },
    ];

    if (Object.keys(matchComentario).length > 0) {
      pipeline.push({ $match: matchComentario });
    }

    pipeline.push(
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$comentarios.createdAt',
            },
          },
          cantidad: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          fecha: '$_id',
          cantidad: 1,
        },
      },
      { $sort: { fecha: 1 } },
    );

    const resultado = await this.publicacionModel.aggregate(pipeline);
    const total = resultado.reduce((acc, curr) => acc + curr.cantidad, 0);

    return {
      datos: resultado,
      total,
    };
  }

  async obtenerEstadisticasComentariosPorPublicacion(
    dto: FiltrarEstadisticasDto,
  ) {
    const { inicio, fin } = this.parsearRangoFechas(dto);
    const matchComentario: Record<string, any> = {};

    if (inicio || fin) {
      matchComentario['comentarios.createdAt'] = {};
      if (inicio) matchComentario['comentarios.createdAt'].$gte = inicio;
      if (fin) matchComentario['comentarios.createdAt'].$lte = fin;
    }

    const pipeline: any[] = [
      { $match: { activo: true } },
      { $unwind: '$comentarios' },
    ];

    if (Object.keys(matchComentario).length > 0) {
      pipeline.push({ $match: matchComentario });
    }

    pipeline.push(
      {
        $group: {
          _id: '$_id',
          titulo: { $first: '$titulo' },
          cantidad: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          publicacionId: { $toString: '$_id' },
          titulo: 1,
          cantidad: 1,
        },
      },
      { $sort: { cantidad: -1 } },
      { $limit: 15 },
    );

    const resultado = await this.publicacionModel.aggregate(pipeline);
    return resultado;
  }

  async obtenerResumenEstadisticas(dto: FiltrarEstadisticasDto) {
    const [publicacionesPorUsuario, comentariosPorTiempo, comentariosPorPublicacion] =
      await Promise.all([
        this.obtenerEstadisticasPublicacionesPorUsuario(dto),
        this.obtenerEstadisticasComentariosPorTiempo(dto),
        this.obtenerEstadisticasComentariosPorPublicacion(dto),
      ]);

    const totalPublicaciones = publicacionesPorUsuario.reduce(
      (acc, curr) => acc + curr.cantidad,
      0,
    );

    return {
      publicacionesPorUsuario,
      comentariosPorTiempo: comentariosPorTiempo.datos,
      totalComentarios: comentariosPorTiempo.total,
      comentariosPorPublicacion,
      totales: {
        totalPublicaciones,
        totalComentarios: comentariosPorTiempo.total,
      },
    };
  }
}
