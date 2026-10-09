import api from "../api/axios";

export type EstadoAsistencia = "Presente" | "Ausente" | "Justificado" | string;

export interface RegistrarAsistenciaDto {
  id_alumno: number;
  id_clase: number;
  estado: EstadoAsistencia;
  observaciones?: string;
}

export interface Asistencia {
  id_asistencia: number;
  id_alumno: number;
  id_clase: number;
  estado: EstadoAsistencia;
  observaciones?: string | null;
  fecha?: string;
  disciplina?: string;
  grupo?: string;
}

type ApiList<T> = T[] | { data?: T[]; rows?: T[] };

function normalizarLista<T>(response: ApiList<T>): T[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.rows)) return response.rows;
  return [];
}

export async function obtenerAsistencias(idAlumno: number): Promise<Asistencia[]> {
  const { data } = await api.get<ApiList<Asistencia>>(
    `/asistencias/alumno/${idAlumno}`,
  );
  return normalizarLista(data);
}

export async function obtenerAsistenciaAlumnoClase(
  idAlumno: number,
  idClase: number,
): Promise<Asistencia[]> {
  const { data } = await api.get<ApiList<Asistencia>>(
    `/asistencias/alumno/${idAlumno}/clase/${idClase}`,
  );
  return normalizarLista(data);
}

export async function registrarAsistencia(
  dto: RegistrarAsistenciaDto,
): Promise<Asistencia> {
  const { data } = await api.post<Asistencia>("/asistencias", dto);
  return data;
}
