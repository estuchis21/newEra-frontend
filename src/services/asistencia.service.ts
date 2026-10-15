import api from "../api/axios";

// =====================================================
// DTO PARA REGISTRAR ASISTENCIA
// =====================================================

export interface RegistrarAsistenciaDto {
  id_alumno: number;
  id_clase: number;
  estado: string;
  observaciones?: string;
}

// =====================================================
// MODELO DE ASISTENCIA
// =====================================================

export interface Asistencia {
  id_asistencia: number;
  id_alumno: number;
  id_clase: number;
  estado: string;
  observaciones?: string;
  fecha?: string;
  disciplina?: string;
  grupo?: string;
}

// =====================================================
// OBTENER TODAS LAS ASISTENCIAS DE UN ALUMNO
// =====================================================

export const obtenerAsistencias = async (
  idAlumno: number
): Promise<Asistencia[]> => {
  const response = await api.get(
    `/asistencias/alumno/${idAlumno}`
  );

  console.log(
    "RESPUESTA COMPLETA DE ASISTENCIAS:",
    response.data
  );

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response.data?.rows)) {
    return response.data.rows;
  }

  console.error(
    "Formato inesperado de asistencias:",
    response.data
  );

  return [];
};

// =====================================================
// OBTENER ASISTENCIA DE UN ALUMNO EN UNA CLASE
// =====================================================

export const obtenerAsistenciaAlumnoClase = async (
  idAlumno: number,
  idClase: number
): Promise<Asistencia[]> => {
  const response = await api.get(
    `/asistencias/alumno/${idAlumno}/clase/${idClase}`
  );

  console.log(
    "ASISTENCIA DEL ALUMNO EN LA CLASE:",
    response.data
  );

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response.data?.rows)) {
    return response.data.rows;
  }

  console.error(
    "Formato inesperado de asistencia:",
    response.data
  );

  return [];
};

// =====================================================
// REGISTRAR ASISTENCIA
// =====================================================

export const registrarAsistencia = async (
  dto: RegistrarAsistenciaDto
) => {
  const response = await api.post(
    "/asistencias",
    dto
  );

  return response.data;
};
