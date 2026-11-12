
import api from "../api/axios";

// ============================================================
// TIPOS
// ============================================================

export interface Cuota {
  id_cuota: number;
  id_alumno: number;

  // Datos del período según la tabla public.cuota
  mes_anio?: string | null;
  periodo?: string | null;

  // Compatibilidad con respuestas anteriores del backend
  mes?: number;
  anio?: number;

  monto?: number | string | null;
  vencimiento?: string | null;
  fecha_vencimiento?: string | null;

  estado?: string | null;

  // Pueden venir en respuestas que incluyen información de pagos
  fecha_pago?: string | null;
  saldo_pendiente?: number | string | null;
  total_pagado?: number | string | null;

  // Compatibilidad con otras respuestas del backend
  id_paquete?: number;
  precio?: number;

  paquete?: {
    id_paquete?: number;
    nombre?: string;
    creditos?: number;
    precio?: number;
  };
}

export interface EstadoAccesoAlumno {
  puedeAcceder: boolean;
  motivo: string | null;
  mensaje: string;
}

// ============================================================
// OBTENER CUOTAS DEL ALUMNO
// ============================================================

export const obtenerCuotasAlumno = async (
  idAlumno: number
): Promise<Cuota[]> => {
  if (!Number.isInteger(idAlumno) || idAlumno <= 0) {
    throw new Error("El ID del alumno no es válido.");
  }

  const response = await api.get(
    `/cuotas/alumno/${idAlumno}`
  );

  const datos = response.data;

  // Permite respuestas directas o respuestas envueltas en data.
  const cuotas = Array.isArray(datos)
    ? datos
    : Array.isArray(datos?.data)
      ? datos.data
      : [];

  return cuotas as Cuota[];
};

// ============================================================
// VERIFICAR ACCESO DEL ALUMNO
// ============================================================

  export interface AccesoAlumnoResponse {
    puedeAcceder: boolean;
    motivo: string | null;
    mensaje: string | null;
  }

  export const verificarAccesoAlumno = async (
    idAlumno: number,
  ): Promise<AccesoAlumnoResponse> => {
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
  idPaquete: number
) => {
  if (
    !Number.isInteger(idAlumno) ||
    idAlumno <= 0 ||
    !Number.isInteger(idPaquete) ||
    idPaquete <= 0
  ) {
    throw new Error("Los datos de la cuota no son válidos.");
  }

  const response = await api.post("/cuotas", {
    id_alumno: idAlumno,
    id_paquete: idPaquete,
  });

  return response.data;
};

// ============================================================
// CREAR PAGO
// ============================================================

export const crearPago = async (idCuota: number) => {
  if (!Number.isInteger(idCuota) || idCuota <= 0) {
    throw new Error("El ID de la cuota no es válido.");
  }

  const response = await api.post("/pagos/crear", {
    id_cuota: idCuota,
  });

  return response.data;
};

export default api;
