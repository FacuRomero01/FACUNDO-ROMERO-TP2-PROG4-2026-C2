import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { AdminGuard } from '../auth/guards/admin.guard.js';
import { CrearUsuarioAdminDto } from './dto/crear-usuario-admin.dto.js';
import { avatarMulterOptions } from '../auth/utils/multer.config.js';

@Controller('usuarios')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: any) {
    return req.user;
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, AdminGuard)
  async listarUsuarios() {
    return this.usersService.listarTodos();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(FileInterceptor('fotoPerfil', avatarMulterOptions))
  async crearUsuario(
    @Body() dto: CrearUsuarioAdminDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.usersService.crearUsuarioPorAdmin(dto, file);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, AdminGuard)
  async deshabilitarUsuario(@Param('id') id: string) {
    return this.usersService.deshabilitarUsuario(id);
  }

  @Post([':id/habilitar', ':id/activar', ':id/alta'])
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, AdminGuard)
  async habilitarUsuario(@Param('id') id: string) {
    return this.usersService.habilitarUsuario(id);
  }
}
