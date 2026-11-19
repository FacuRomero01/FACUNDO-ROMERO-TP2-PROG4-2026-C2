import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Types } from 'mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UserRole } from './schemas/user.schema.js';

describe('UsersService', () => {
  let service: UsersService;
  let mockUserModel: any;

  beforeEach(() => {
    function MockModel(this: any, dto: any) {
      Object.assign(this, dto);
      this._id = new Types.ObjectId();
      this.save = vi.fn().mockResolvedValue({
        _id: this._id,
        ...dto,
        toObject: () => ({ _id: this._id, ...dto }),
      });
      this.toObject = () => ({ _id: this._id, ...dto });
    }

    MockModel.findOne = vi.fn();
    MockModel.findById = vi.fn();
    MockModel.find = vi.fn();

    mockUserModel = MockModel;
    service = new UsersService(mockUserModel as any);
  });

  describe('listarTodos', () => {
    it('debe listar los usuarios sanitizados', async () => {
      const mockUsers = [
        {
          _id: new Types.ObjectId(),
          nombre: 'Soldier',
          password: 'hash',
          toObject: () => ({
            _id: '1',
            nombre: 'Soldier',
            password: 'hash',
          }),
        },
      ];

      mockUserModel.find.mockReturnValue({
        select: vi.fn().mockReturnValue({
          sort: vi.fn().mockReturnValue({
            exec: vi.fn().mockResolvedValue(mockUsers),
          }),
        }),
      });

      const resultado = await service.listarTodos();
      expect(resultado).toHaveLength(1);
      expect(resultado[0].password).toBeUndefined();
      expect(resultado[0].nombre).toBe('Soldier');
    });
  });

  describe('crearUsuarioPorAdmin', () => {
    it('debe lanzar ConflictException si el email ya existe', async () => {
      mockUserModel.findOne.mockReturnValue({
        exec: vi.fn().mockResolvedValue({ email: 'soldier@mannco.com' }),
      });

      await expect(
        service.crearUsuarioPorAdmin({
          nombre: 'Jane',
          apellido: 'Doe',
          email: 'soldier@mannco.com',
          username: 'soldier',
          password: 'Password123',
          fechaNacimiento: '1980-01-01',
          perfil: UserRole.USUARIO,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('debe crear un usuario con el rol especificado por admin', async () => {
      // Email no existe
      mockUserModel.findOne.mockReturnValueOnce({
        exec: vi.fn().mockResolvedValue(null),
      });
      // Username no existe
      mockUserModel.findOne.mockReturnValueOnce({
        exec: vi.fn().mockResolvedValue(null),
      });

      const resultado = await service.crearUsuarioPorAdmin({
        nombre: 'Administrador',
        apellido: 'General',
        email: 'admin@mannco.com',
        username: 'admin_general',
        password: 'Password123',
        fechaNacimiento: '1985-05-15',
        perfil: UserRole.ADMINISTRADOR,
      });

      expect(resultado.message).toBe('Usuario creado exitosamente');
      expect(resultado.usuario.perfil).toBe(UserRole.ADMINISTRADOR);
      expect(resultado.usuario.password).toBeUndefined();
    });
  });

  describe('deshabilitarUsuario y habilitarUsuario', () => {
    it('debe lanzar NotFoundException si el id no es valido o el usuario no existe', async () => {
      await expect(service.deshabilitarUsuario('invalido')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.habilitarUsuario('invalido')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debe deshabilitar un usuario (activo = false)', async () => {
      const mockId = new Types.ObjectId().toString();
      const mockUser = {
        _id: mockId,
        activo: true,
        save: vi.fn().mockResolvedValue(true),
        toObject: () => ({ _id: mockId, activo: false }),
      };

      mockUserModel.findById.mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockUser),
      });

      const resultado = await service.deshabilitarUsuario(mockId);
      expect(mockUser.activo).toBe(false);
      expect(mockUser.save).toHaveBeenCalled();
      expect(resultado.message).toBe('Usuario deshabilitado exitosamente');
    });

    it('debe habilitar un usuario previamente deshabilitado (activo = true)', async () => {
      const mockId = new Types.ObjectId().toString();
      const mockUser = {
        _id: mockId,
        activo: false,
        save: vi.fn().mockResolvedValue(true),
        toObject: () => ({ _id: mockId, activo: true }),
      };

      mockUserModel.findById.mockReturnValue({
        exec: vi.fn().mockResolvedValue(mockUser),
      });

      const resultado = await service.habilitarUsuario(mockId);
      expect(mockUser.activo).toBe(true);
      expect(mockUser.save).toHaveBeenCalled();
      expect(resultado.message).toBe('Usuario habilitado exitosamente');
    });
  });
});
