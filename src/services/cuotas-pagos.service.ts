import api from "../api/axios";

export interface Cuota {
  id_cuota: number;
  id_alumno: number;
  mes?: number;
  anio?: number;
  estado?: string;
  monto?: number | string;
  fecha_vencimiento?: string;
  fecha_pago?: string | null;
  id_paquete?: number;

  paquete?: {
    id_paquete: number;
    nombre?: string;
    creditos?: number;
    cantidad_creditos?: number;
    precio?: number | string;
  };
}

export interface PreferenciaPagoResponse {
  id?: string;
  init_point?: string;
  sandbox_init_point?: string;
  url?: string;
  message?: string;
  [key: string]: unknown;
}

export interface CrearCuotaDto {
  id_alumno: number;
  id_paquete: number;
}

export interface CrearPagoDto {
  id_cuota: number;
}

/**
 * GET /cuotas/alumno/:idAlumno
 * Obtiene las cuotas de un alumno.
 */
export async function obtenerCuotasAlumno(
  idAlumno: number
): Promise<Cuota[]> {
  const { data } = await api.get<Cuota[]>(
    `/cuotas/alumno/${idAlumno}`
  );

  if (Array.isArray(data)) {
    return data;
  }

  return [];
}

/**
 * POST /cuotas
 * Crea una cuota asociada al alumno y al paquete.
 */
export async function crearCuota(
  idAlumno: number,
  idPaquete: number
): Promise<unknown> {
  const payload: CrearCuotaDto = {
    id_alumno: Number(idAlumno),
    id_paquete: Number(idPaquete),
  };

  const { data } = await api.post(
    "/cuotas",
    payload
  );

  return data;
}

/**
 * POST /pagos/crear
 * Solicita la creación de un pago para una cuota.
 */
export async function crearPago(
  idCuota: number
): Promise<PreferenciaPagoResponse> {
  const payload: CrearPagoDto = {
    id_cuota: Number(idCuota),
  };

  const { data } = await api.post<PreferenciaPagoResponse>(
    "/pagos/crear",
    payload
  );

  return data;
}

const cuotasService = {
  obtenerCuotasAlumno,
  crearCuota,
  crearPago,
};

export default cuotasService;
