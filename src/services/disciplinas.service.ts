import api from "../api/axios";

export interface Disciplina {
  id_disciplina: number;
  disciplina: string;
}

export async function obtenerDisciplinas(): Promise<Disciplina[]> {
  const { data } = await api.get<Disciplina[]>("/disciplinas");
  return data;
}

export async function obtenerDisciplina(idDisciplina: number): Promise<Disciplina> {
  const { data } = await api.get<Disciplina>(`/disciplinas/${idDisciplina}`);
  return data;
}

export async function crearDisciplina(disciplina: string): Promise<Disciplina> {
  const { data } = await api.post<Disciplina>("/disciplinas/crear", { disciplina });
  return data;
}
