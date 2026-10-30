
import api from '../api/axios';

// ============================================================
// TIPOS
// ============================================================

export interface Cuota {
  id_cuota: number;
  id_alumno: number;
  id_paquete: number;

  mes?: number;
  anio?: number;

  estado?: string;
  monto?: number;
  fecha_vencimiento?: string;
  fecha_pago?: string;

  paquete?: {
    id_paquete: number;
    nombre?: string;
    creditos?: number;
    precio?: number;
  };
}

// ============================================================
// TIPO: ESTADO DE ACCESO DEL ALUMNO
// ============================================================

export interface EstadoAccesoAlumno {
  puedeAcceder: boolean;
  motivo: string | null;
  mensaje: string;
}

// ============================================================
// OBTENER CUOTAS DEL ALUMNO
// ============================================================

export const obtenerCuotasAlumno = async (
  idAlumno: number,
): Promise<Cuota[]> => {
  const response = await api.get(
    `/cuotas/alumno/${idAlumno}`,
  );

  return Array.isArray(response.data)
    ? response.data
    : [];
};

// ============================================================
// VERIFICAR ACCESO DEL ALUMNO
// ============================================================

export const verificarAccesoAlumno = async (
  idAlumno: number,
): Promise<EstadoAccesoAlumno> => {
  const response = await api.get(
    `/cuotas/alumno/${idAlumno}/acceso`,
  );

  return response.data;
};

// ============================================================
// CREAR CUOTA
// ============================================================

export const crearCuota = async (
  idAlumno: number,
  idPaquete: number,
) => {
  const response = await api.post(
    '/cuotas',
    {
      id_alumno: idAlumno,
      id_paquete: idPaquete,
    },
  );

  return response.data;
};

// ============================================================
// CREAR PAGO
// ============================================================

export const crearPago = async (
  idCuota: number,
) => {
  const response = await api.post(
    '/pagos/crear',
    {
      id_cuota: idCuota,
    },
  );

  return response.data;
};

export default api;
