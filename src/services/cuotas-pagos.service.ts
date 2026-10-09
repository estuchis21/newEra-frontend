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

export async function obtenerCuotasAlumno(idAlumno: number): Promise<Cuota[]> {
  const { data } = await api.get<Cuota[]>(`/cuotas/alumno/${idAlumno}`);
  return Array.isArray(data) ? data : [];
}

/**
 * Ruta conservada del frontend actual. Requiere POST /cuotas en NestJS.
 * Confirmar que el controller y DTO del backend acepten estos nombres snake_case.
 */
export async function crearCuota(idAlumno: number, idPaquete: number): Promise<unknown> {
  const { data } = await api.post("/cuotas", {
    id_alumno: idAlumno,
    id_paquete: idPaquete,
  });
  return data;
}

/**
 * Ruta conservada del frontend actual. Requiere POST /pagos/crear en NestJS.
 */
export async function crearPago(idCuota: number): Promise<unknown> {
  const { data } = await api.post("/pagos/crear", {
    id_cuota: idCuota,
  });
  return data;
}
