import { Test, TestingModule } from '@nestjs/testing';
import { PublicacionesController } from './publicaciones.controller.js';
import { PublicacionesService } from './publicaciones.service.js';

describe('PublicacionesController', () => {
  let controller: PublicacionesController;
  let service: PublicacionesService;

  const mockService = {
    crearPublicacion: vi.fn(),
    listarPublicaciones: vi.fn(),
    buscarPorId: vi.fn(),
    eliminarPublicacion: vi.fn(),
    darMeGusta: vi.fn(),
    quitarMeGusta: vi.fn(),
    obtenerUltimasPorUsuario: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicacionesController],
      providers: [
        {
          provide: PublicacionesService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<PublicacionesController>(PublicacionesController);
    service = module.get<PublicacionesService>(PublicacionesService);
  });

  it('debe estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('debe llamar a crearPublicacion con el usuario autenticado', async () => {
    const mockReq = {
      user: { _id: 'user123', perfil: 'usuario' },
    };
    const dto = { titulo: 'Prueba', descripcion: 'Texto' };
    const mockArchivo = {} as Express.Multer.File;

    mockService.crearPublicacion.mockResolvedValue({ _id: 'pub1', ...dto });

    const resultado = await controller.crear(dto, mockArchivo, mockReq);
    expect(resultado).toBeDefined();
    expect(service.crearPublicacion).toHaveBeenCalledWith(dto, 'user123', mockArchivo);
  });

  it('debe listar publicaciones con filtros', async () => {
    const filtros = { offset: 0, limit: 10, orden: 'fecha' };
    mockService.listarPublicaciones.mockResolvedValue({
      publicaciones: [],
      total: 0,
      offset: 0,
      limit: 10,
    });

    const resultado = await controller.listar(filtros);
    expect(resultado.total).toBe(0);
    expect(service.listarPublicaciones).toHaveBeenCalledWith(filtros);
  });

  it('debe dar de baja una publicación con el usuario y rol correspondiente', async () => {
    const mockReq = {
      user: { _id: 'user123', perfil: 'administrador' },
    };
    mockService.eliminarPublicacion.mockResolvedValue({
      message: 'Publicación dada de baja exitosamente',
    });

    const resultado = await controller.eliminar('pub123', mockReq);
    expect(resultado.message).toContain('dada de baja');
    expect(service.eliminarPublicacion).toHaveBeenCalledWith('pub123', 'user123', 'administrador');
  });

  it('debe dar me gusta a una publicación', async () => {
    const mockReq = {
      user: { _id: 'user123' },
    };
    mockService.darMeGusta.mockResolvedValue({ _id: 'pub123', meGusta: ['user123'] });

    const resultado = await controller.darMeGusta('pub123', mockReq);
    expect(resultado.meGusta).toContain('user123');
    expect(service.darMeGusta).toHaveBeenCalledWith('pub123', 'user123');
  });

  it('debe quitar me gusta de una publicación', async () => {
    const mockReq = {
      user: { _id: 'user123' },
    };
    mockService.quitarMeGusta.mockResolvedValue({ _id: 'pub123', meGusta: [] });

    const resultado = await controller.quitarMeGusta('pub123', mockReq);
    expect(resultado.meGusta).toHaveLength(0);
    expect(service.quitarMeGusta).toHaveBeenCalledWith('pub123', 'user123');
  });
});
