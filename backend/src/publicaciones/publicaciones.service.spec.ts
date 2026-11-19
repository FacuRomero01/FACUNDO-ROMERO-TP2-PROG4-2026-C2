import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { PublicacionesService } from './publicaciones.service.js';
import { Publicacion } from './schemas/publicacion.schema.js';

describe('PublicacionesService', () => {
  let servicio: PublicacionesService;
  let mockPublicacionModel: any;

  const mockUsuarioId = new Types.ObjectId().toString();
  const mockOtroUsuarioId = new Types.ObjectId().toString();
  const mockPublicacionId = new Types.ObjectId().toString();

  const crearMockPublicacion = (datos: Partial<any> = {}) => ({
    _id: new Types.ObjectId(mockPublicacionId),
    titulo: 'Título de prueba',
    descripcion: 'Descripción detallada de la publicación',
    imagenUrl: null,
    autor: new Types.ObjectId(mockUsuarioId),
    meGusta: [],
    comentarios: [],
    activo: true,
    save: vi.fn().mockImplementation(function () {
      return Promise.resolve(this);
    }),
    ...datos,
  });

  beforeEach(async () => {
    class MockModelConstructor {
      titulo: string;
      descripcion: string;
      imagenUrl: string | null;
      autor: Types.ObjectId;
      meGusta: any[];
      comentarios: any[];
      activo: boolean;

      constructor(datos: any) {
        this.titulo = datos.titulo;
        this.descripcion = datos.descripcion;
        this.imagenUrl = datos.imagenUrl;
        this.autor = datos.autor;
        this.meGusta = datos.meGusta || [];
        this.comentarios = datos.comentarios || [];
        this.activo = datos.activo ?? true;
      }

      save = vi.fn().mockResolvedValue({
        _id: new Types.ObjectId(mockPublicacionId),
        ...this,
      });

      static find = vi.fn();
      static findOne = vi.fn();
      static findById = vi.fn();
      static countDocuments = vi.fn();
      static aggregate = vi.fn();
    }

    mockPublicacionModel = MockModelConstructor;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublicacionesService,
        {
          provide: getModelToken(Publicacion.name),
          useValue: mockPublicacionModel,
        },
      ],
    }).compile();

    servicio = module.get<PublicacionesService>(PublicacionesService);
  });

  it('debe estar definido', () => {
    expect(servicio).toBeDefined();
  });

  describe('crearPublicacion', () => {
    it('debe crear una publicación sin archivo adjunto', async () => {
      const mockExec = vi.fn().mockResolvedValue({
        _id: mockPublicacionId,
        titulo: 'Informe de campo',
        descripcion: 'Detalle de la misión',
        autor: { nombre: 'Facundo', username: 'facur' },
      });
      mockPublicacionModel.findById = vi.fn().mockReturnValue({
        populate: vi.fn().mockReturnValue({
          exec: mockExec,
        }),
      });

      const resultado = await servicio.crearPublicacion(
        {
          titulo: 'Informe de campo',
          descripcion: 'Detalle de la misión',
        },
        mockUsuarioId,
      );

      expect(resultado).toBeDefined();
      expect(mockPublicacionModel.findById).toHaveBeenCalled();
    });

    it('debe asignar la ruta del archivo cuando se adjunta una imagen', async () => {
      const mockArchivo = {
        filename: 'foto-123.jpg',
      } as Express.Multer.File;

      const mockExec = vi.fn().mockResolvedValue({
        _id: mockPublicacionId,
        titulo: 'Informe con foto',
        descripcion: 'Detalle',
        imagenUrl: '/uploads/publicaciones/foto-123.jpg',
      });
      mockPublicacionModel.findById = vi.fn().mockReturnValue({
        populate: vi.fn().mockReturnValue({
          exec: mockExec,
        }),
      });

      const resultado = await servicio.crearPublicacion(
        {
          titulo: 'Informe con foto',
          descripcion: 'Detalle',
        },
        mockUsuarioId,
        mockArchivo,
      );

      expect(resultado.imagenUrl).toBe('/uploads/publicaciones/foto-123.jpg');
    });
  });

  describe('listarPublicaciones', () => {
    it('debe listar publicaciones ordenadas por fecha por defecto', async () => {
      const mockLista = [crearMockPublicacion()];
      mockPublicacionModel.countDocuments = vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue(1),
      });

      const mockQueryChain = {
        sort: vi.fn().mockReturnThis(),
        skip: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue(mockLista),
      };
      mockPublicacionModel.find = vi.fn().mockReturnValue(mockQueryChain);

      const resultado = await servicio.listarPublicaciones({
        offset: 0,
        limit: 5,
        orden: 'fecha',
      });

      expect(resultado.total).toBe(1);
      expect(resultado.publicaciones).toHaveLength(1);
      expect(mockQueryChain.sort).toHaveBeenCalledWith({ createdAt: -1 });
    });

    it('debe ordenar por cantidad de me gusta cuando se solicita', async () => {
      mockPublicacionModel.countDocuments = vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue(2),
      });

      const id1 = new Types.ObjectId();
      const id2 = new Types.ObjectId();

      mockPublicacionModel.aggregate = vi.fn().mockResolvedValue([
        { _id: id1 },
        { _id: id2 },
      ]);

      const doc1 = crearMockPublicacion({ _id: id1, meGusta: [new Types.ObjectId()] });
      const doc2 = crearMockPublicacion({ _id: id2, meGusta: [] });

      const mockQueryChain = {
        populate: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue([doc1, doc2]),
      };
      mockPublicacionModel.find = vi.fn().mockReturnValue(mockQueryChain);

      const resultado = await servicio.listarPublicaciones({
        offset: 0,
        limit: 10,
        orden: 'meGusta',
      });

      expect(mockPublicacionModel.aggregate).toHaveBeenCalled();
      expect(resultado.publicaciones).toHaveLength(2);
    });
  });

  describe('eliminarPublicacion (baja lógica)', () => {
    it('debe permitir que el autor elimine su propia publicación', async () => {
      const publicacion = crearMockPublicacion();
      mockPublicacionModel.findOne = vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue(publicacion),
      });

      const respuesta = await servicio.eliminarPublicacion(
        mockPublicacionId,
        mockUsuarioId,
        'usuario',
      );

      expect(respuesta.message).toContain('dada de baja');
      expect(publicacion.activo).toBe(false);
      expect(publicacion.save).toHaveBeenCalled();
    });

    it('debe permitir que un administrador elimine cualquier publicación', async () => {
      const publicacion = crearMockPublicacion();
      mockPublicacionModel.findOne = vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue(publicacion),
      });

      const respuesta = await servicio.eliminarPublicacion(
        mockPublicacionId,
        mockOtroUsuarioId,
        'administrador',
      );

      expect(respuesta.message).toContain('dada de baja');
      expect(publicacion.activo).toBe(false);
    });

    it('debe lanzar ForbiddenException si otro usuario intenta eliminar una publicación ajena', async () => {
      const publicacion = crearMockPublicacion();
      mockPublicacionModel.findOne = vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue(publicacion),
      });

      await expect(
        servicio.eliminarPublicacion(
          mockPublicacionId,
          mockOtroUsuarioId,
          'usuario',
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('debe lanzar NotFoundException si la publicación no existe', async () => {
      mockPublicacionModel.findOne = vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue(null),
      });

      await expect(
        servicio.eliminarPublicacion(
          mockPublicacionId,
          mockUsuarioId,
          'usuario',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('darMeGusta y quitarMeGusta', () => {
    it('debe registrar un me gusta si el usuario aún no lo había dado', async () => {
      const publicacion = crearMockPublicacion({ meGusta: [] });
      mockPublicacionModel.findOne = vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue(publicacion),
        populate: vi.fn().mockReturnThis(),
      });

      vi.spyOn(servicio, 'buscarPorId').mockResolvedValue(publicacion as any);

      const resultado = await servicio.darMeGusta(
        mockPublicacionId,
        mockOtroUsuarioId,
      );

      expect(publicacion.meGusta).toContainEqual(new Types.ObjectId(mockOtroUsuarioId));
      expect(publicacion.save).toHaveBeenCalled();
      expect(resultado).toBeDefined();
    });

    it('debe lanzar BadRequestException si el usuario ya dio me gusta', async () => {
      const idUsuario = new Types.ObjectId();
      const publicacion = crearMockPublicacion({ meGusta: [idUsuario] });
      mockPublicacionModel.findOne = vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue(publicacion),
      });

      await expect(
        servicio.darMeGusta(mockPublicacionId, idUsuario.toString()),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe quitar el me gusta si el usuario lo había dado previamente', async () => {
      const idUsuario = new Types.ObjectId();
      const publicacion = crearMockPublicacion({ meGusta: [idUsuario] });
      mockPublicacionModel.findOne = vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue(publicacion),
      });

      vi.spyOn(servicio, 'buscarPorId').mockResolvedValue(publicacion as any);

      await servicio.quitarMeGusta(mockPublicacionId, idUsuario.toString());

      expect(publicacion.meGusta).toHaveLength(0);
      expect(publicacion.save).toHaveBeenCalled();
    });

    it('debe lanzar BadRequestException si el usuario intenta quitar un me gusta que no dio', async () => {
      const publicacion = crearMockPublicacion({ meGusta: [] });
      mockPublicacionModel.findOne = vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue(publicacion),
      });

      await expect(
        servicio.quitarMeGusta(mockPublicacionId, mockOtroUsuarioId),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('obtenerUltimasPorUsuario', () => {
    it('debe devolver las publicaciones activas del usuario ordenadas por fecha', async () => {
      const mockResultados = [crearMockPublicacion(), crearMockPublicacion()];
      const mockChain = {
        sort: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        populate: vi.fn().mockReturnThis(),
        exec: vi.fn().mockResolvedValue(mockResultados),
      };
      mockPublicacionModel.find = vi.fn().mockReturnValue(mockChain);

      const res = await servicio.obtenerUltimasPorUsuario(mockUsuarioId, 3);
      expect(res).toHaveLength(2);
      expect(mockChain.limit).toHaveBeenCalledWith(3);
    });
  });

  describe('comentarios', () => {
    it('debe crear un comentario y guardarlo en la publicación', async () => {
      const publicacion = crearMockPublicacion();
      publicacion.populate = vi.fn().mockResolvedValue(publicacion);
      mockPublicacionModel.findOne = vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue(publicacion),
      });

      const dto = { mensaje: 'Gran posteo' };
      const res = await servicio.crearComentario(mockPublicacionId, mockUsuarioId, dto);

      expect(publicacion.comentarios).toHaveLength(1);
      expect(publicacion.comentarios[0].mensaje).toBe('Gran posteo');
      expect(publicacion.comentarios[0].modificado).toBe(false);
      expect(publicacion.save).toHaveBeenCalled();
      expect(res.mensaje).toBe('Gran posteo');
    });

    it('debe editar un comentario y marcar modificado: true', async () => {
      const comId = new Types.ObjectId();
      const publicacion = crearMockPublicacion({
        comentarios: [
          {
            _id: comId,
            autor: new Types.ObjectId(mockUsuarioId),
            mensaje: 'Mensaje viejo',
            modificado: false,
          },
        ],
      });
      publicacion.populate = vi.fn().mockResolvedValue(publicacion);
      mockPublicacionModel.findOne = vi.fn().mockReturnValue({
        populate: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(publicacion),
        }),
      });

      const dto = { mensaje: 'Mensaje editado' };
      const res = await servicio.editarComentario(
        mockPublicacionId,
        comId.toString(),
        mockUsuarioId,
        dto,
      );

      expect(res.mensaje).toBe('Mensaje editado');
      expect(res.modificado).toBe(true);
      expect(publicacion.save).toHaveBeenCalled();
    });

    it('debe lanzar ForbiddenException si otro usuario intenta editar el comentario', async () => {
      const comId = new Types.ObjectId();
      const publicacion = crearMockPublicacion({
        comentarios: [
          {
            _id: comId,
            autor: new Types.ObjectId(mockUsuarioId),
            mensaje: 'Mensaje viejo',
            modificado: false,
          },
        ],
      });
      mockPublicacionModel.findOne = vi.fn().mockReturnValue({
        populate: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(publicacion),
        }),
      });

      const dto = { mensaje: 'Intento hack' };
      await expect(
        servicio.editarComentario(
          mockPublicacionId,
          comId.toString(),
          mockOtroUsuarioId,
          dto,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('debe listar comentarios paginados y ordenados por fecha descendente', async () => {
      const comAntiguo = {
        _id: new Types.ObjectId(),
        autor: new Types.ObjectId(mockUsuarioId),
        mensaje: 'Primero',
        createdAt: new Date('2026-01-01T10:00:00Z'),
      };
      const comReciente = {
        _id: new Types.ObjectId(),
        autor: new Types.ObjectId(mockUsuarioId),
        mensaje: 'Segundo',
        createdAt: new Date('2026-01-02T10:00:00Z'),
      };

      const publicacion = crearMockPublicacion({
        comentarios: [comAntiguo, comReciente],
      });

      mockPublicacionModel.findOne = vi.fn().mockReturnValue({
        populate: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(publicacion),
        }),
      });

      const res = await servicio.listarComentarios(mockPublicacionId, {
        offset: 0,
        limit: 1,
      });

      expect(res.total).toBe(2);
      expect(res.comentarios).toHaveLength(1);
      expect(res.comentarios[0].mensaje).toBe('Segundo'); // El más reciente primero
    });
  });

  describe('Estadísticas', () => {
    it('debe calcular estadísticas de publicaciones por usuario', async () => {
      mockPublicacionModel.aggregate = vi.fn().mockResolvedValue([
        { usuarioId: '1', username: 'spy', nombreCompleto: 'Red Spy', cantidad: 3 },
      ]);

      const resultado = await servicio.obtenerEstadisticasPublicacionesPorUsuario({
        desde: '2026-01-01',
        hasta: '2026-01-31',
      });

      expect(resultado).toHaveLength(1);
      expect(resultado[0].username).toBe('spy');
      expect(mockPublicacionModel.aggregate).toHaveBeenCalled();
    });

    it('debe calcular estadísticas de comentarios por tiempo', async () => {
      mockPublicacionModel.aggregate = vi.fn().mockResolvedValue([
        { fecha: '2026-01-01', cantidad: 5 },
      ]);

      const resultado = await servicio.obtenerEstadisticasComentariosPorTiempo({});

      expect(resultado.total).toBe(5);
      expect(resultado.datos).toHaveLength(1);
    });

    it('debe calcular estadísticas de comentarios por publicación', async () => {
      mockPublicacionModel.aggregate = vi.fn().mockResolvedValue([
        { publicacionId: 'p1', titulo: 'Informe confidencial', cantidad: 10 },
      ]);

      const resultado = await servicio.obtenerEstadisticasComentariosPorPublicacion({});

      expect(resultado).toHaveLength(1);
      expect(resultado[0].titulo).toBe('Informe confidencial');
    });

    it('debe filtrar publicaciones incluyendo todo el día final con formato YYYY-MM-DD', async () => {
      let matchCapturado: any = null;
      mockPublicacionModel.aggregate = vi.fn().mockImplementation((pipeline: any[]) => {
        matchCapturado = pipeline[0].$match;
        return Promise.resolve([]);
      });

      await servicio.obtenerEstadisticasPublicacionesPorUsuario({
        desde: '2026-11-12',
        hasta: '2026-11-19',
      });

      expect(matchCapturado).toBeDefined();
      expect(matchCapturado.createdAt).toBeDefined();
      expect(matchCapturado.createdAt.$lte).toBeInstanceOf(Date);
      // El fin de fecha debe ser al menos las 23:59:59 del día solicitado
      const finEsperadoMinimo = new Date(Date.UTC(2026, 10, 19, 23, 59, 59, 999));
      expect(matchCapturado.createdAt.$lte.getTime()).toBeGreaterThanOrEqual(
        finEsperadoMinimo.getTime(),
      );
    });

    it('debe obtener un resumen consolidado de estadísticas', async () => {
      mockPublicacionModel.aggregate = vi
        .fn()
        .mockResolvedValueOnce([{ usuarioId: '1', cantidad: 2 }]) // pubs
        .mockResolvedValueOnce([{ fecha: '2026-01-01', cantidad: 4 }]) // coms tiempo
        .mockResolvedValueOnce([{ publicacionId: 'p1', cantidad: 4 }]); // coms pub

      const resumen = await servicio.obtenerResumenEstadisticas({});

      expect(resumen.totales.totalPublicaciones).toBe(2);
      expect(resumen.totales.totalComentarios).toBe(4);
      expect(resumen.publicacionesPorUsuario).toHaveLength(1);
      expect(resumen.comentariosPorPublicacion).toHaveLength(1);
    });
  });
});
