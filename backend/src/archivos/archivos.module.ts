import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ArchivosService } from './archivos.service.js';

@Module({
  imports: [ConfigModule],
  providers: [ArchivosService],
  exports: [ArchivosService],
})
export class ArchivosModule {}
