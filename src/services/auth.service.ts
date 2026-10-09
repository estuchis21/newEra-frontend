import api from "../api/axios";

export interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  dni: string | null;
  email: string;
  username: string;
  celular: string | null;
  id_rol: number;
}

export interface LoginDto {
  email: string;
  contrasena: string;
}

export interface ApiEnvelope<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface RegistroDto {
  usuario: {
    nombre: string;
    apellido: string;
    dni: string;
    email: string;
    contrasena: string;
    username: string;
    celular: string;
    id_rol: number;
  };
  es_menor: boolean | null;
}

export interface Alumno {
  id_alumno: number;
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  dni?: string | null;
}

export async function login(dto: LoginDto): Promise<Usuario> {
  const { data } = await api.post<ApiEnvelope<Usuario>>("/alumnos/login", dto);
  return data.data;
}

export async function registrarAlumno(dto: RegistroDto): Promise<Usuario> {
  const { data } = await api.post<ApiEnvelope<Usuario>>("/alumnos", dto);
  return data.data;
}

export async function obtenerIdAlumnoPorUsuario(
  idUsuario: number,
): Promise<number | null> {
  const { data } = await api.get<ApiEnvelope<number | null>>(
    `/alumnos/obtenerIdAlumnoPorUsuario/${idUsuario}`,
  );
  return data.data;
}

export async function findAlumnoByEmail(email: string): Promise<Alumno | null> {
  const { data } = await api.get<ApiEnvelope<Alumno | null>>(
    `/alumnos/findByEmail/${encodeURIComponent(email)}`,
  );
  return data.data;
}

export async function solicitarRecuperacion(email: string): Promise<unknown> {
  const { data } = await api.post("/alumnos/forgot-password", { email });
  return data;
}

export async function restablecerContrasena(
  token: string,
  nuevaContrasena: string,
): Promise<unknown> {
  const { data } = await api.post("/alumnos/reset-password", {
    token,
    nuevaContrasena,
  });
  return data;
}
