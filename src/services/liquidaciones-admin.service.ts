
import api from "../api/axios";

export type EstadoLiquidacion = "Pendiente" | "Pagado" | "Anulado";

export interface LiquidacionAdmin {
  id_liquidacion: number;
  id_cuota: number;
  id_profesor: number;
  monto_base: number | string;
  porcentaje: number | string;
  monto_profesor: number | string;
  monto_academia: number | string;
  monto_transferido?: number | string | null;
  fecha_generacion: string;
  fecha_transferencia?: string | null;
  estado: EstadoLiquidacion;
  mes_anio?: string;
  id_alumno?: number;
  nombre_profesor?: string;
  apellido_profesor?: string;
  email_profesor?: string;
}

export interface CuentaCobro {
  id_cuenta: number;
  id_profesor: number;
  alias?: string | null;
  cbu_cvu?: string | null;
  titular: string;
  cuit_cuil?: string | null;
  tipo_cuenta: "CBU" | "CVU";
  activa: boolean;
}

export interface RegistrarCuentaDto {
  alias?: string;
  cbu_cvu?: string;
  titular: string;
  cuit_cuil?: string;
  tipo_cuenta: "CBU" | "CVU";
}

export interface RegistrarTransferenciaDto {
  monto_transferido: number;
  fecha_transferencia: string;
  id_cuenta: number;
  id_operacion_transferencia?: string;
  observaciones_transferencia?: string;
}

const normalizarArray = <T,>(respuesta: any): T[] => {
  const datos = respuesta?.data ?? respuesta;
  return Array.isArray(datos) ? datos : [];
};

export async function obtenerLiquidacionesAdmin(): Promise<LiquidacionAdmin[]> {
  const response = await api.get("/liquidaciones-profesores");
  return normalizarArray<LiquidacionAdmin>(response.data);
}

export async function obtenerCuentaProfesor(
  idProfesor: number,
): Promise<CuentaCobro | null> {
  const response = await api.get(
    `/liquidaciones-profesores/profesor/${idProfesor}/cuenta`,
  );

  const datos = response.data?.cuenta ?? response.data?.data ?? response.data;

  return datos && datos.id_cuenta ? datos as CuentaCobro : null;
}

export async function guardarCuentaProfesor(
  idProfesor: number,
  datos: RegistrarCuentaDto,
) {
  const response = await api.post(
    `/liquidaciones-profesores/profesor/${idProfesor}/cuenta`,
    datos,
  );

  return response.data;
}

export async function registrarTransferenciaAdmin(
  idLiquidacion: number,
  datos: RegistrarTransferenciaDto,
) {
  const response = await api.patch(
    `/liquidaciones-profesores/${idLiquidacion}/pagar`,
    datos,
  );

  return response.data;
}

export async function anularLiquidacionAdmin(idLiquidacion: number) {
  const response = await api.patch(
    `/liquidaciones-profesores/${idLiquidacion}/anular`,
  );

  return response.data;
}
