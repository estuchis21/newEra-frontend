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

export async function obtenerDashboardAdmin(idUsuario: number) {
  const response = await api.get<AdminDashboard>(
    `/administracion/dashboard/${idUsuario}`,
  );
  return response.data;
}

export async function obtenerAlumnosAdmin(
  idUsuario: number,
  buscar = "",
) {
  const response = await api.get(
    `/administracion/alumnos/${idUsuario}`,
    { params: { buscar } },
  );
  return response.data;
}

export async function obtenerGruposAdmin(idUsuario: number) {
  const response = await api.get(
    `/administracion/grupos/${idUsuario}`,
  );
  return response.data;
}

export async function obtenerCuotasPendientesAdmin(idUsuario: number) {
  const response = await api.get(
    `/administracion/cuotas-pendientes/${idUsuario}`,
  );
  return response.data;
}

export async function obtenerPagosRecientesAdmin(idUsuario: number) {
  const response = await api.get(
    `/administracion/pagos-recientes/${idUsuario}`,
  );
  return response.data;
}
