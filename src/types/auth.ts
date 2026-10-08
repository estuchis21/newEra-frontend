export interface LoginDto {
  email: string;
  contrasena: string;
}

export interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  id_rol: number;
}

export interface LoginResponse {
  statusCode: number;
  message: string;
  data: Usuario;
}