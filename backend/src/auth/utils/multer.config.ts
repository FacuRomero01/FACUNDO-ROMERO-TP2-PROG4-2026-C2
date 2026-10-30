import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import * as fs from 'fs';

const UPLOAD_DEST = join(process.cwd(), 'uploads', 'avatars');

export const avatarMulterOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      if (!fs.existsSync(UPLOAD_DEST)) {
        fs.mkdirSync(UPLOAD_DEST, { recursive: true });
      }
      cb(null, UPLOAD_DEST);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const fileExt = extname(file.originalname).toLowerCase();
      cb(null, `avatar-${uniqueSuffix}${fileExt}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req: any, file: Express.Multer.File, cb: any) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/i)) {
      return cb(
        new BadRequestException(
          'El archivo debe ser una imagen válida (JPG, JPEG, PNG, GIF, WEBP)',
        ),
        false,
      );
    }
    cb(null, true);
  },
};
