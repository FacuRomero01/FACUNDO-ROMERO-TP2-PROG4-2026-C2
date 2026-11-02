import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import * as fs from 'fs';

@Injectable()
export class ArchivosService {
  private readonly logger = new Logger(ArchivosService.name);
  private readonly estaConfiguradoCloudinary: boolean;

  constructor(private readonly configService: ConfigService) {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
        secure: true,
      });
      this.estaConfiguradoCloudinary = true;
      this.logger.log('Servicio de Cloudinary configurado y activo.');
    } else {
      this.estaConfiguradoCloudinary = false;
      this.logger.log(
        'Cloudinary no configurado (modo local). Las imágenes se almacenarán en el disco local.',
      );
    }
  }

  /**
   * Sube una imagen a Cloudinary si está disponible; de lo contrario retorna la ruta local de fallback.
   * Si la subida a Cloudinary tiene éxito, elimina el archivo temporal del disco local.
   */
  async subirImagen(
    archivo: Express.Multer.File,
    carpeta: string,
    rutaFallbackLocal: string,
  ): Promise<string> {
    if (!this.estaConfiguradoCloudinary || !archivo?.path) {
      return rutaFallbackLocal;
    }

    try {
      const resultado: UploadApiResponse = await cloudinary.uploader.upload(
        archivo.path,
        {
          folder: `conecta/${carpeta}`,
          resource_type: 'image',
        },
      );

      // Limpieza del archivo temporal local tras la subida exitosa a la nube
      try {
        if (fs.existsSync(archivo.path)) {
          await fs.promises.unlink(archivo.path);
        }
      } catch (errorLimpieza) {
        this.logger.warn(
          `No se pudo eliminar el archivo temporal: ${archivo.path}`,
        );
      }

      return resultado.secure_url;
    } catch (error) {
      this.logger.error(
        'Error al subir archivo a Cloudinary. Se mantiene el archivo en disco local como respaldo.',
        error,
      );
      return rutaFallbackLocal;
    }
  }

  estaActivo(): boolean {
    return this.estaConfiguradoCloudinary;
  }
}
