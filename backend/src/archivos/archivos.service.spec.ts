import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ArchivosService } from './archivos.service.js';
import { v2 as cloudinary } from 'cloudinary';

describe('ArchivosService', () => {
  let service: ArchivosService;
  let mockConfigService: Partial<ConfigService>;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Cuando Cloudinary NO está configurado', () => {
    beforeEach(async () => {
      mockConfigService = {
        get: vi.fn().mockReturnValue(undefined),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ArchivosService,
          { provide: ConfigService, useValue: mockConfigService },
        ],
      }).compile();

      service = module.get<ArchivosService>(ArchivosService);
    });

    it('debe indicar que no está activo y retornar la ruta local', async () => {
      expect(service.estaActivo()).toBe(false);

      const mockFile = {
        path: '/tmp/test.png',
        filename: 'test.png',
      } as Express.Multer.File;

      const resultado = await service.subirImagen(
        mockFile,
        'avatars',
        '/uploads/avatars/test.png',
      );

      expect(resultado).toBe('/uploads/avatars/test.png');
    });
  });

  describe('Cuando Cloudinary SÍ está configurado', () => {
    beforeEach(async () => {
      mockConfigService = {
        get: vi.fn().mockImplementation((key: string) => {
          if (key === 'CLOUDINARY_CLOUD_NAME') return 'mi_cloud';
          if (key === 'CLOUDINARY_API_KEY') return 'mi_key';
          if (key === 'CLOUDINARY_API_SECRET') return 'mi_secret';
          return undefined;
        }),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ArchivosService,
          { provide: ConfigService, useValue: mockConfigService },
        ],
      }).compile();

      service = module.get<ArchivosService>(ArchivosService);
    });

    it('debe indicar que está activo y subir a Cloudinary', async () => {
      expect(service.estaActivo()).toBe(true);

      vi.spyOn(cloudinary.uploader, 'upload').mockResolvedValue({
        secure_url: 'https://res.cloudinary.com/mi_cloud/image/upload/v1234/foto.jpg',
      } as any);

      const mockFile = {
        path: '/tmp/test.png',
        filename: 'test.png',
      } as Express.Multer.File;

      const resultado = await service.subirImagen(
        mockFile,
        'publicaciones',
        '/uploads/publicaciones/test.png',
      );

      expect(resultado).toBe(
        'https://res.cloudinary.com/mi_cloud/image/upload/v1234/foto.jpg',
      );
    });

    it('debe retornar la ruta local de respaldo si la subida a Cloudinary falla', async () => {
      vi.spyOn(cloudinary.uploader, 'upload').mockRejectedValue(
        new Error('Network error'),
      );

      const mockFile = {
        path: '/tmp/test.png',
        filename: 'test.png',
      } as Express.Multer.File;

      const resultado = await service.subirImagen(
        mockFile,
        'avatars',
        '/uploads/avatars/test.png',
      );

      expect(resultado).toBe('/uploads/avatars/test.png');
    });
  });
});
