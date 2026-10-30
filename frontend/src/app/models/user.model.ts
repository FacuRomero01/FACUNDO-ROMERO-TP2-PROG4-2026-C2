export type UserRole = 'usuario' | 'administrador';

export interface User {
  _id: string;
  nombre: string;
  apellido: string;
  email: string;
  username: string;
  fechaNacimiento: string;
  descripcion?: string;
  fotoPerfil: string;
  perfil: UserRole;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface LoginDto {
  identificador: string;
  password: string;
}
