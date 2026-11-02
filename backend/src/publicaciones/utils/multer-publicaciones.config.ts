import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';

const DIRECTORIO_DESTINO = join(process.cwd(), 'uploads', 'publicaciones');

export const opcionesMulterPublicacion = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      if (!fs.existsSync(DIRECTORIO_DESTINO)) {
        fs.mkdirSync(DIRECTORIO_DESTINO, { recursive: true });
      }
      cb(null, DIRECTORIO_DESTINO);
    },
    filename: (req, file, cb) => {
      const sufijoUnico = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const extensionArchivo = extname(file.originalname).toLowerCase();
      cb(null, `publicacion-${sufijoUnico}${extensionArchivo}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // Máximo 5MB
  },
  fileFilter: (req: any, file: Express.Multer.File, cb: any) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/i)) {
      return cb(
        new BadRequestException(
          'El archivo adjunto debe ser una imagen válida (JPG, JPEG, PNG, GIF, WEBP)',
        ),
        false,
      );
    }
    cb(null, true);
  },
};
