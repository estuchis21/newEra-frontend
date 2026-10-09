import api from "../api/axios";

export interface HorarioGrupo {
  id_horario?: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
}

export interface Grupo {
  id_grupo: number;
  id_disciplina: number;
  disciplina: string;
  nivel: string;
  cupo_max: number;
  activo: boolean;
  id_inscripcion?: number;
  id_profesor?: number;
  profesor?: string;
  dia_semana?: string;
  hora_inicio?: string;
  hora_fin?: string;
  horarios?: HorarioGrupo[];
}

export interface Clase {
  id_clase: number;
  id_grupo: number;
  id_tipo_clase?: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
  disciplina?: string;
  nivel?: string;
}

export interface GrupoCrearDto {
  id_disciplina: number;
  nivel: string;
  cupo_max: number;
  id_profesor: number;
  horarios: Array<{
    dia_semana: string;
    hora_inicio: string;
    hora_fin: string;
  }>;
}

export interface AlumnoClase {
  id_alumno: number;
  nombre: string;
  apellido: string;
  dni?: string;
}

export async function obtenerGruposAlumno(idAlumno: number): Promise<Grupo[]> {
  const { data } = await api.get<Grupo[]>(`/grupos/alumno/${idAlumno}`);
  return data;
}

export async function obtenerGruposDisponibles(): Promise<Grupo[]> {
  const { data } = await api.get<Grupo[]>("/grupos/disponibles");
  return data;
}

export async function inscribirseGrupo(idAlumno: number, idGrupo: number): Promise<unknown> {
  const { data } = await api.post("/inscripciones", {
    idAlumno,
    idGrupo,
  });
  return data;
}

export async function eliminarInscripcion(idInscripcion: number): Promise<unknown> {
  const { data } = await api.delete(`/inscripciones/${idInscripcion}`);
  return data;
}

export async function crearGrupo(grupo: GrupoCrearDto): Promise<Grupo> {
  const { data } = await api.post<Grupo>("/grupos", grupo);
  return data;
}

export async function obtenerGruposProfesor(idProfesor: number): Promise<Grupo[]> {
  const { data } = await api.get<Grupo[]>(`/grupos/profesor/${idProfesor}`);
  return data;
}

export async function obtenerClasesProfesor(
  idProfesor: number,
  fecha?: string,
): Promise<Clase[]> {
  const { data } = await api.get<Clase[]>(
    `/grupos/profesor/${idProfesor}/clases`,
    { params: fecha ? { fecha } : undefined },
  );
  return data;
}

export async function obtenerAlumnosPorClase(idClase: number): Promise<AlumnoClase[]> {
  const { data } = await api.get<AlumnoClase[]>(`/grupos/clase/${idClase}/alumnos`);
  return data;
}

export async function obtenerTodasLasClases(): Promise<Clase[]> {
  const { data } = await api.get<Clase[]>("/grupos/clases");
  return data;
}

export async function obtenerClasePorId(idClase: number): Promise<Clase> {
  const { data } = await api.get<Clase>(`/grupos/clases/${idClase}`);
  return data;
}
