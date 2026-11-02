import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema.js';

export type ComentarioDocument = Comentario & Document;

@Schema({ timestamps: true })
export class Comentario {
  _id?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  autor: Types.ObjectId | User;

  @Prop({ required: true, trim: true })
  mensaje: string;

  @Prop({ default: false })
  modificado: boolean;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const ComentarioSchema = SchemaFactory.createForClass(Comentario);

export type PublicacionDocument = Publicacion & Document;

@Schema({ timestamps: true })
export class Publicacion {
  _id?: Types.ObjectId;

  @Prop({ required: true, trim: true })
  titulo: string;

  @Prop({ required: true, trim: true })
  descripcion: string;

  @Prop({ default: null })
  imagenUrl?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  autor: Types.ObjectId | User;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  meGusta: Types.ObjectId[];

  @Prop({ type: [ComentarioSchema], default: [] })
  comentarios: Comentario[];

  @Prop({ default: true })
  activo: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);
