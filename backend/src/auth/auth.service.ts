import {
  BadRequestException,
  ConflictException,
  Injectable,
  Optional,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { UserRole } from '../users/schemas/user.schema.js';
import { ArchivosService } from '../archivos/archivos.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Optional() private readonly archivosService?: ArchivosService,
  ) {}

  async register(registerDto: RegisterDto, file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('La imagen de perfil es obligatoria');
    }

    // Comprobar unicidad de email
    const existingEmail = await this.usersService.findByEmail(registerDto.email);
    if (existingEmail) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    // Comprobar unicidad de username
    const existingUsername = await this.usersService.findByUsername(
      registerDto.username,
    );
    if (existingUsername) {
      throw new ConflictException('El nombre de usuario ya está en uso');
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Guardar referencia relativa accesible de la imagen o subir a Cloudinary si está activo
    let fotoPerfil = `/uploads/avatars/${file.filename}`;
    if (this.archivosService) {
      fotoPerfil = await this.archivosService.subirImagen(
        file,
        'avatars',
        fotoPerfil,
      );
    }

    // Crear usuario forzando siempre el rol 'usuario' por defecto
    // para evitar cualquier manipulación o escalada de privilegios
    const newUser = await this.usersService.create({
      nombre: registerDto.nombre.trim(),
      apellido: registerDto.apellido.trim(),
      email: registerDto.email.toLowerCase().trim(),
      username: registerDto.username.toLowerCase().trim(),
      password: hashedPassword,
      fechaNacimiento: registerDto.fechaNacimiento,
      descripcion: (registerDto.descripcion || '').trim(),
      fotoPerfil,
      perfil: UserRole.USUARIO,
      activo: true,
    });

    const payload = {
      sub: newUser._id.toString(),
      email: newUser.email,
      username: newUser.username,
      perfil: newUser.perfil,
    };

    const token = this.jwtService.sign(payload);

    return {
      message: 'Usuario registrado exitosamente',
      token,
      user: this.usersService.sanitizeUser(newUser),
    };
  }

  async login(loginDto: LoginDto) {
    const identifier = loginDto.getIdentifier();
    if (!identifier) {
      throw new BadRequestException(
        'El usuario o correo electrónico es obligatorio',
      );
    }

    const user = await this.usersService.findByEmailOrUsername(identifier);
    if (!user) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    if (!user.activo) {
      throw new UnauthorizedException(
        'Esta cuenta se encuentra deshabilitada. Contacte a un administrador.',
      );
    }

    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const payload = {
      sub: user._id.toString(),
      email: user.email,
      username: user.username,
      perfil: user.perfil,
    };

    const token = this.jwtService.sign(payload);

    return {
      message: 'Inicio de sesión exitoso',
      token,
      user: this.usersService.sanitizeUser(user),
    };
  }

  async authorize(user: any) {
    const usuarioSanitizado = this.usersService.sanitizeUser(user);
    return {
      valid: true,
      user: usuarioSanitizado,
      ...usuarioSanitizado,
    };
  }

  async refrescarToken(user: any) {
    const usuarioSanitizado = this.usersService.sanitizeUser(user);
    const sub = (
      user._id?.toString() ||
      user.id ||
      user.sub
    ).toString();

    const payload = {
      sub,
      email: user.email,
      username: user.username,
      perfil: user.perfil,
    };

    const token = this.jwtService.sign(payload);

    return {
      message: 'Token refrescado exitosamente',
      token,
      user: usuarioSanitizado,
    };
  }
}
