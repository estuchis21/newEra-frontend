import api from "../api/axios";

export interface AdminDashboard {
  alumnos: number;
  profesores: number;
  grupos: number;
  clasesHoy: number;
  cuotasPendientes: number;
  montoPendiente: number;
  pagosAprobados: number;
  ingresos: number;
  asistencia: {
    presentes: number;
    ausentes: number;
  };
}

export interface AlumnoAdmin {
  id_alumno: number;
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  dni?: string | null;
  celular?: string | null;
}

export interface GrupoAdmin {
  id_grupo: number;
  id_disciplina: number;
  disciplina: string;
  id_profesor?: number;
  profesor?: string;
  nivel: string;
  cupo_max: number;
  activo: boolean;
}

export interface CuotaPendienteAdmin {
  id_cuota: number;
  id_alumno: number;
  monto?: number | string;
  estado?: string;
  fecha_vencimiento?: string;
  alumno?: string;
}

export interface PagoRecienteAdmin {
  id_pago: number;
  id_cuota: number;
  monto?: number | string;
  estado?: string;
  fecha_pago?: string;
  alumno?: string;
}

export async function obtenerDashboardAdmin(idUsuario: number): Promise<AdminDashboard> {
  const { data } = await api.get<AdminDashboard>(
    `/administracion/dashboard/${idUsuario}`,
  );
  return data;
}

export async function obtenerAlumnosAdmin(
  idUsuario: number,
  buscar = "",
): Promise<AlumnoAdmin[]> {
  const { data } = await api.get<AlumnoAdmin[]>(
    `/administracion/alumnos/${idUsuario}`,
    { params: { buscar } },
  );
  return data;
}

export async function obtenerGruposAdmin(idUsuario: number): Promise<GrupoAdmin[]> {
  const { data } = await api.get<GrupoAdmin[]>(
    `/administracion/grupos/${idUsuario}`,
  );
  return data;
}

export async function obtenerCuotasPendientesAdmin(
  idUsuario: number,
): Promise<CuotaPendienteAdmin[]> {
  const { data } = await api.get<CuotaPendienteAdmin[]>(
    `/administracion/cuotas-pendientes/${idUsuario}`,
  );
  return data;
}

export async function obtenerPagosRecientesAdmin(
  idUsuario: number,
): Promise<PagoRecienteAdmin[]> {
  const { data } = await api.get<PagoRecienteAdmin[]>(
    `/administracion/pagos-recientes/${idUsuario}`,
  );
  return data;
}
