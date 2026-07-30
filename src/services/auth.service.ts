import api from "../api/axios";
import type {LoginDto, Usuario} from "../types/auth";
import type { LoginResponse } from "../types/auth";

export async function login(dto: LoginDto): Promise<Usuario> {
  const response = await api.post<LoginResponse>(
    "/alumnos/login",
    dto
  );

  return response.data.data;
}

export async function registrarAlumno(dto: any) {
  const response = await api.post(
    "/alumnos",
    dto
  );

  return response.data;
}