import api from "../api/axios";

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

export async function obtenerClases(): Promise<Clase[]> {
  const { data } = await api.get<Clase[]>("/clases");
  return data;
}

export async function obtenerClase(idClase: number): Promise<Clase> {
  const { data } = await api.get<Clase>(`/clases/${idClase}`);
  return data;
}

export async function obtenerClasesGrupo(idGrupo: number): Promise<Clase[]> {
  const { data } = await api.get<Clase[]>(`/clases/grupo/${idGrupo}`);
  return data;
}
