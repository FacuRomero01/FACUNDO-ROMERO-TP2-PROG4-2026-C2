import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const usuario = request.user;

    if (!usuario) {
      throw new ForbiddenException('Se requiere autenticación');
    }

    if (usuario.perfil !== 'administrador') {
      throw new ForbiddenException(
        'Acceso denegado: se requieren permisos de administrador',
      );
    }

    return true;
  }
}
