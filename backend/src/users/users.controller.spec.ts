import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UsersController } from './users.controller.js';
import { UserRole } from './schemas/user.schema.js';

describe('UsersController', () => {
  let controller: UsersController;
  let mockUsersService: any;

  beforeEach(() => {
    mockUsersService = {
      listarTodos: vi.fn(),
      crearUsuarioPorAdmin: vi.fn(),
      deshabilitarUsuario: vi.fn(),
      habilitarUsuario: vi.fn(),
    };

    controller = new UsersController(mockUsersService);
  });

  it('debe listar los usuarios', async () => {
    mockUsersService.listarTodos.mockResolvedValue([{ username: 'soldier' }]);
    const res = await controller.listarUsuarios();
    expect(res).toEqual([{ username: 'soldier' }]);
    expect(mockUsersService.listarTodos).toHaveBeenCalled();
  });

  it('debe crear un usuario por admin', async () => {
    const dto = {
      nombre: 'Jane',
      apellido: 'Doe',
      email: 'jane@mannco.com',
      username: 'jane_admin',
      password: 'Password123',
      fechaNacimiento: '1990-01-01',
      perfil: UserRole.ADMINISTRADOR,
    };
    mockUsersService.crearUsuarioPorAdmin.mockResolvedValue({
      message: 'Usuario creado exitosamente',
    });

    const res = await controller.crearUsuario(dto);
    expect(res.message).toBe('Usuario creado exitosamente');
    expect(mockUsersService.crearUsuarioPorAdmin).toHaveBeenCalledWith(
      dto,
      undefined,
    );
  });

  it('debe deshabilitar un usuario', async () => {
    mockUsersService.deshabilitarUsuario.mockResolvedValue({
      message: 'Usuario deshabilitado exitosamente',
    });
    const res = await controller.deshabilitarUsuario('user123');
    expect(res.message).toBe('Usuario deshabilitado exitosamente');
    expect(mockUsersService.deshabilitarUsuario).toHaveBeenCalledWith('user123');
  });

  it('debe habilitar un usuario', async () => {
    mockUsersService.habilitarUsuario.mockResolvedValue({
      message: 'Usuario habilitado exitosamente',
    });
    const res = await controller.habilitarUsuario('user123');
    expect(res.message).toBe('Usuario habilitado exitosamente');
    expect(mockUsersService.habilitarUsuario).toHaveBeenCalledWith('user123');
  });
});
