export interface PublicacionPorUsuarioEstadistica {
  usuarioId: string;
  username: string;
  nombreCompleto: string;
  fotoPerfil?: string;
  cantidad: number;
}

export interface ComentarioPorTiempoEstadistica {
  fecha: string;
  cantidad: number;
}

export interface ComentarioPorPublicacionEstadistica {
  publicacionId: string;
  titulo: string;
  cantidad: number;
}

export interface ResumenEstadisticas {
  publicacionesPorUsuario: PublicacionPorUsuarioEstadistica[];
  comentariosPorTiempo: ComentarioPorTiempoEstadistica[];
  totalComentarios: number;
  comentariosPorPublicacion: ComentarioPorPublicacionEstadistica[];
  totales: {
    totalPublicaciones: number;
    totalComentarios: number;
  };
}

export interface FiltroEstadisticas {
  desde?: string;
  hasta?: string;
}
