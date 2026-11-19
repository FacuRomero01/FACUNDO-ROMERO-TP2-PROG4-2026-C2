import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  Optional,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument, UserRole } from './schemas/user.schema.js';
import { CrearUsuarioAdminDto } from './dto/crear-usuario-admin.dto.js';
import { ArchivosService } from '../archivos/archivos.service.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @Optional() private readonly archivosService?: ArchivosService,
  ) {}

  async create(userData: Partial<User>): Promise<UserDocument> {
    const createdUser = new this.userModel(userData);
    return createdUser.save();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase().trim() }).exec();
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ username: username.toLowerCase().trim() })
      .exec();
  }

  async findByEmailOrUsername(identifier: string): Promise<UserDocument | null> {
    const clean = identifier.toLowerCase().trim();
    return this.userModel
      .findOne({
        $or: [{ email: clean }, { username: clean }],
      })
      .exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return this.userModel.findById(id).exec();
  }

  sanitizeUser(user: UserDocument | any) {
    if (!user) return null;
    const userObj = user.toObject ? user.toObject() : { ...user };
    const { password, ...sanitized } = userObj;
    return sanitized;
  }

  async listarTodos(): Promise<any[]> {
    const usuarios = await this.userModel
      .find()
      .select('-password')
      .sort({ createdAt: -1 })
      .exec();

    return usuarios.map((u) => this.sanitizeUser(u));
  }

  async crearUsuarioPorAdmin(
    dto: CrearUsuarioAdminDto,
    file?: Express.Multer.File,
  ): Promise<any> {
    const cleanEmail = dto.email.toLowerCase().trim();
    const cleanUsername = dto.username.toLowerCase().trim();

    const existingEmail = await this.findByEmail(cleanEmail);
    if (existingEmail) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    const existingUsername = await this.findByUsername(cleanUsername);
    if (existingUsername) {
      throw new ConflictException('El nombre de usuario ya está en uso');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    let fotoPerfil = '/uploads/avatars/default.png';
    if (file) {
      fotoPerfil = `/uploads/avatars/${file.filename}`;
      if (this.archivosService) {
        fotoPerfil = await this.archivosService.subirImagen(
          file,
          'avatars',
          fotoPerfil,
        );
      }
    }

    const perfil = dto.perfil || UserRole.USUARIO;

    const nuevoUsuario = await this.create({
      nombre: dto.nombre.trim(),
      apellido: dto.apellido.trim(),
      email: cleanEmail,
      username: cleanUsername,
      password: hashedPassword,
      fechaNacimiento: dto.fechaNacimiento,
      descripcion: (dto.descripcion || '').trim(),
      fotoPerfil,
      perfil,
      activo: true,
    });

    return {
      message: 'Usuario creado exitosamente',
      usuario: this.sanitizeUser(nuevoUsuario),
    };
  }

  async deshabilitarUsuario(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const usuario = await this.userModel.findById(id).exec();
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    usuario.activo = false;
    await usuario.save();

    return {
      message: 'Usuario deshabilitado exitosamente',
      usuario: this.sanitizeUser(usuario),
    };
  }

  async habilitarUsuario(id: string): Promise<any> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const usuario = await this.userModel.findById(id).exec();
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    usuario.activo = true;
    await usuario.save();

    return {
      message: 'Usuario habilitado exitosamente',
      usuario: this.sanitizeUser(usuario),
    };
  }
}
