import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service.js';
import { AuthController } from './auth.controller.js';
import { UsersModule } from '../users/users.module.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { AdminGuard } from './guards/admin.guard.js';
import { ArchivosModule } from '../archivos/archivos.module.js';

@Module({
  imports: [
    UsersModule,
    ArchivosModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secretoJwt = configService.get<string>('JWT_SECRET');
        if (!secretoJwt) {
          throw new Error(
            'La variable de entorno JWT_SECRET no está configurada.',
          );
        }
        return {
          secret: secretoJwt,
          signOptions: {
            expiresIn: (configService.get<string>('JWT_EXPIRES_IN') || '15m') as any,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtAuthGuard, AdminGuard],
  exports: [AuthService, JwtAuthGuard, AdminGuard, JwtModule],
})
export class AuthModule {}
