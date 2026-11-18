import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  const mockUsersService = {
    findByEmail: vi.fn(),
    findByUsername: vi.fn(),
    findByEmailOrUsername: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    sanitizeUser: vi.fn((user) => ({
      _id: user._id || 'user123',
      email: user.email,
      username: user.username,
      perfil: user.perfil,
    })),
  };

  const mockJwtService = {
    sign: vi.fn().mockReturnValue('mocked_jwt_token_sprint3'),
  };

  const mockConfigService = {
    get: vi.fn((key) => {
      if (key === 'JWT_SECRET') return 'test_secret';
      if (key === 'JWT_EXPIRES_IN') return '15m';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  it('debe autorizar un usuario y devolver datos sanitizados', async () => {
    const usuario = {
      _id: 'user123',
      email: 'soldier@mannco.com',
      username: 'soldier',
      perfil: 'usuario',
    };

    const resultado = await service.authorize(usuario);
    expect(resultado.valid).toBe(true);
    expect(resultado.user).toBeDefined();
    expect(resultado.user.email).toBe(usuario.email);
  });

  it('debe refrescar un token manteniendo el payload original y 15m de expiración', async () => {
    const usuario = {
      _id: 'user123',
      email: 'heavy@mannco.com',
      username: 'heavy',
      perfil: 'administrador',
    };

    const resultado = await service.refrescarToken(usuario);
    expect(resultado.message).toBe('Token refrescado exitosamente');
    expect(resultado.token).toBe('mocked_jwt_token_sprint3');
    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: 'user123',
      email: 'heavy@mannco.com',
      username: 'heavy',
      perfil: 'administrador',
    });
    expect(resultado.user.username).toBe('heavy');
  });
});
