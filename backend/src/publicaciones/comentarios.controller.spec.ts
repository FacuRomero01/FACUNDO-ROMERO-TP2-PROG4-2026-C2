import { Test, TestingModule } from '@nestjs/testing';
import { ComentariosController } from './comentarios.controller.js';
import { PublicacionesService } from './publicaciones.service.js';

describe('ComentariosController', () => {
  let controller: ComentariosController;
  let service: PublicacionesService;

  const mockService = {
    crearComentario: vi.fn(),
    editarComentario: vi.fn(),
    listarComentarios: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComentariosController],
      providers: [
        {
          provide: PublicacionesService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ComentariosController>(ComentariosController);
    service = module.get<PublicacionesService>(PublicacionesService);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('debe agregar un comentario correctamente', async () => {
    const mockReq = {
      user: { _id: 'user123' },
    };
    const dto = { mensaje: 'Excelente publicación' };
    const comentarioCreado = {
      _id: 'com1',
      mensaje: dto.mensaje,
      autor: { _id: 'user123', nombre: 'Test' },
      modificado: false,
      createdAt: new Date(),
    };

    mockService.crearComentario.mockResolvedValue(comentarioCreado);

    const resultado = await controller.agregarComentario('pub1', dto, mockReq);
    expect(resultado).toEqual(comentarioCreado);
    expect(service.crearComentario).toHaveBeenCalledWith('pub1', 'user123', dto);
  });

  it('debe listar comentarios paginados', async () => {
    const filtros = { offset: 0, limit: 5 };
    const respuestaMock = {
      comentarios: [],
      total: 0,
      offset: 0,
      limit: 5,
    };

    mockService.listarComentarios.mockResolvedValue(respuestaMock);

    const resultado = await controller.listarComentarios('pub1', filtros);
    expect(resultado).toEqual(respuestaMock);
    expect(service.listarComentarios).toHaveBeenCalledWith('pub1', filtros);
  });

  it('debe modificar un comentario en publicación', async () => {
    const mockReq = {
      user: { _id: 'user123' },
    };
    const dto = { mensaje: 'Mensaje editado' };
    const comentarioModificado = {
      _id: 'com1',
      mensaje: 'Mensaje editado',
      modificado: true,
    };

    mockService.editarComentario.mockResolvedValue(comentarioModificado);

    const resultado = await controller.modificarComentarioEnPublicacion(
      'pub1',
      'com1',
      dto,
      mockReq,
    );
    expect(resultado).toEqual(comentarioModificado);
    expect(service.editarComentario).toHaveBeenCalledWith(
      'pub1',
      'com1',
      'user123',
      dto,
    );
  });

  it('debe modificar un comentario directamente', async () => {
    const mockReq = {
      user: { _id: 'user123' },
    };
    const dto = { mensaje: 'Mensaje editado directo' };
    const comentarioModificado = {
      _id: 'com1',
      mensaje: dto.mensaje,
      modificado: true,
    };

    mockService.editarComentario.mockResolvedValue(comentarioModificado);

    const resultado = await controller.modificarComentarioDirecto(
      'com1',
      dto,
      mockReq,
    );
    expect(resultado).toEqual(comentarioModificado);
    expect(service.editarComentario).toHaveBeenCalledWith(
      undefined,
      'com1',
      'user123',
      dto,
    );
  });
});
