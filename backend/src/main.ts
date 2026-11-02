import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { join } from 'path';
import * as fs from 'fs';

async function bootstrap() {
  // Asegurar existencia de carpetas de uploads
  const uploadDirAvatars = join(process.cwd(), 'uploads', 'avatars');
  if (!fs.existsSync(uploadDirAvatars)) {
    fs.mkdirSync(uploadDirAvatars, { recursive: true });
  }

  const uploadDirPublicaciones = join(process.cwd(), 'uploads', 'publicaciones');
  if (!fs.existsSync(uploadDirPublicaciones)) {
    fs.mkdirSync(uploadDirPublicaciones, { recursive: true });
  }

  const app = await NestFactory.create(AppModule);

  // Habilitar CORS para comunicación fluida con el frontend de Angular
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Prefijo global de API
  app.setGlobalPrefix('api');

  // Pipe global de validaciones con transformación de tipos
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      forbidUnknownValues: false,
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`Servidor NestJS corriendo en el puerto ${port}`);
}

bootstrap();
