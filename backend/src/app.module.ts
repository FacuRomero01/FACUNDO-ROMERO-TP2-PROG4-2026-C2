import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { PublicacionesModule } from './publicaciones/publicaciones.module.js';
import { ArchivosModule } from './archivos/archivos.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri:
          configService.get<string>('MONGODB_URI') ||
          'mongodb://127.0.0.1:27017/red_social',
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    ArchivosModule,
    UsersModule,
    AuthModule,
    PublicacionesModule,
  ],
})
export class AppModule {}
