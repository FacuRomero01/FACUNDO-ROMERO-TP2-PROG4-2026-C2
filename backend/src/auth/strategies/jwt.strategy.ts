import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service.js';

export interface JwtPayload {
  sub: string;
  email: string;
  username: string;
  perfil: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const secretoJwt = configService.get<string>('JWT_SECRET');
    if (!secretoJwt) {
      throw new Error('La variable de entorno JWT_SECRET no está configurada.');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        ExtractJwt.fromBodyField('token'),
        (req: any) => req?.cookies?.token,
      ]),
      ignoreExpiration: false,
      secretOrKey: secretoJwt,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.activo) {
      throw new UnauthorizedException('Token no válido o usuario inactivo');
    }
    return this.usersService.sanitizeUser(user);
  }
}
