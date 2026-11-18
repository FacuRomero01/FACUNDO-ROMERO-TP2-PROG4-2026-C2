export interface AutorPublicacion {
  _id: string;
  nombre: string;
  apellido: string;
  username: string;
  fotoPerfil?: string;
  perfil?: string;
}

export interface Comentario {
  _id?: string;
  autor: AutorPublicacion;
  mensaje: string;
  modificado?: boolean;
  createdAt?: string;
}

export interface Publicacion {
  _id: string;
  titulo: string;
  descripcion: string;
  imagenUrl?: string | null;
  autor: AutorPublicacion;
  meGusta: string[];
  comentarios?: Comentario[];
  activo: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface RespuestaPublicaciones {
  publicaciones: Publicacion[];
  total: number;
  offset: number;
  limit: number;
}

export interface RespuestaComentarios {
  comentarios: Comentario[];
  total: number;
  offset: number;
  limit: number;
}

export interface CrearComentarioPayload {
  mensaje: string;
}

export interface EditarComentarioPayload {
  mensaje: string;
}

export type OrdenPublicaciones = 'fecha' | 'meGusta';
