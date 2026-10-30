import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Publicacion,
  PublicacionDocument,
} from './schemas/publicacion.schema.js';

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name)
    private readonly publicacionModel: Model<PublicacionDocument>,
  ) {}

  async findAll(options?: { offset?: number; limit?: number; sort?: string }) {
    // Estructura base preparada para Sprint 2
    return this.publicacionModel
      .find({ activo: true })
      .populate('autor', 'nombre apellido username fotoPerfil')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByUser(userId: string) {
    return this.publicacionModel
      .find({ autor: userId, activo: true })
      .sort({ createdAt: -1 })
      .exec();
  }
}
