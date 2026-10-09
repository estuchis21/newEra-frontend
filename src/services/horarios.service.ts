import api from "../api/axios";

export interface CrearHorarioGrupoDto {
  idGrupo: number;
  diaSemana: string;
  horaInicio: string;
  horaFin: string;
}

export interface HorarioGrupo {
  id_horario: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
}

export async function agregarHorarioGrupo(dto: CrearHorarioGrupoDto): Promise<unknown> {
  const { data } = await api.post("/horarios/grupo", dto);
  return data;
}

export async function obtenerHorariosGrupo(idGrupo: number): Promise<HorarioGrupo[]> {
  const { data } = await api.get<HorarioGrupo[]>(`/horarios/grupo/${idGrupo}`);
  return data;
}
