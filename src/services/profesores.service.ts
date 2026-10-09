import api from "../api/axios";

export interface Profesor {
  id_profesor: number;
  id_usuario: number;
  nombre?: string;
  apellido?: string;
  email?: string;
}

export interface LiquidacionProfesor {
  id_liquidacion: number;
  id_profesor?: number;
  id_reserva?: number;
  monto_base: number | string;
  porcentaje: number | string;
  monto_profesor: number | string;
  monto_academia: number | string;
  fecha_generacion: string;
  estado: string;
}

type ApiList<T> = T[] | { data?: T[]; rows?: T[] };

function normalizarLista<T>(response: ApiList<T>): T[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.rows)) return response.rows;
  return [];
}

export async function obtenerProfesorPorUsuario(idUsuario: number): Promise<Profesor | null> {
  const { data } = await api.get<Profesor | null>(`/profesores/usuario/${idUsuario}`);
  return data;
}

export async function obtenerLiquidacionesProfesor(
  idProfesor: number,
): Promise<LiquidacionProfesor[]> {
  const { data } = await api.get<ApiList<LiquidacionProfesor>>(
    `/profesores/liquidaciones/${idProfesor}`,
  );
  return normalizarLista(data);
}
