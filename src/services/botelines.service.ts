
import api from "../api/axios";

// =====================================================
// TIPOS
// =====================================================

export interface Boletin {
  id_boletin: number;
  id_alumno: number;
  id_grupo: number;
  id_profesor: number;
  id_periodo: number;
  anio: number;
  fecha_evaluacion: string;
  observaciones: string | null;

  // Datos complementarios devueltos por los JOIN del backend
  nombre_alumno?: string;
  apellido_alumno?: string;
  nombre_profesor?: string;
  apellido_profesor?: string;
  disciplina?: string;
  nivel?: string;
  periodo?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
}

export interface CrearBoletin {
  id_alumno: number;
  id_grupo: number;
  id_profesor: number;
  id_periodo: number;
  anio: number;
  fecha_evaluacion?: string;
  observaciones?: string;
}

export interface ActualizarBoletin {
  id_alumno?: number;
  id_grupo?: number;
  id_profesor?: number;
  id_periodo?: number;
  anio?: number;
  fecha_evaluacion?: string;
  observaciones?: string | null;
}

export interface FiltrosBoletines {
  id_alumno?: number;
  id_grupo?: number;
  id_profesor?: number;
  id_periodo?: number;
  anio?: number;
}

export interface RespuestaBoletines {
  mensaje?: string;
  boletin?: Boletin;
  boletines?: Boletin[];
}

// =====================================================
// NORMALIZACIÓN DE RESPUESTAS
// =====================================================

function extraerBoletines(respuesta: unknown): Boletin[] {
  if (Array.isArray(respuesta)) {
    return respuesta as Boletin[];
  }

  if (
    typeof respuesta === "object" &&
    respuesta !== null
  ) {
    const data = respuesta as Record<string, unknown>;

    if (Array.isArray(data.boletines)) {
      return data.boletines as Boletin[];
    }

    if (Array.isArray(data.data)) {
      return data.data as Boletin[];
    }
  }

  return [];
}

// =====================================================
// OBTENER TODOS LOS BOLETINES
// =====================================================

export async function obtenerBoletines(): Promise<Boletin[]> {
  const respuesta = await api.get("/boletines");

  return extraerBoletines(respuesta.data);
}

// =====================================================
// OBTENER BOLETÍN POR ID
// =====================================================

export async function obtenerBoletinPorId(
  idBoletin: number
): Promise<Boletin> {
  const respuesta = await api.get(
    `/boletines/${idBoletin}`
  );

  return respuesta.data?.boletin ?? respuesta.data;
}

// =====================================================
// OBTENER BOLETINES DE UN ALUMNO
// =====================================================

export async function obtenerBoletinesAlumno(
  idAlumno: number
): Promise<Boletin[]> {
  const respuesta = await api.get(
    `/boletines/alumno/${idAlumno}`
  );

  return extraerBoletines(respuesta.data);
}

// =====================================================
// OBTENER BOLETINES DE UN GRUPO
// =====================================================

export async function obtenerBoletinesGrupo(
  idGrupo: number
): Promise<Boletin[]> {
  const respuesta = await api.get(
    `/boletines/grupo/${idGrupo}`
  );

  return extraerBoletines(respuesta.data);
}

// =====================================================
// OBTENER BOLETINES DE UN PROFESOR
// =====================================================

export async function obtenerBoletinesProfesor(
  idProfesor: number
): Promise<Boletin[]> {
  const respuesta = await api.get(
    `/boletines/profesor/${idProfesor}`
  );

  return extraerBoletines(respuesta.data);
}

// =====================================================
// OBTENER BOLETINES DE UN PERÍODO
// =====================================================

export async function obtenerBoletinesPeriodo(
  idPeriodo: number
): Promise<Boletin[]> {
  const respuesta = await api.get(
    `/boletines/periodo/${idPeriodo}`
  );

  return extraerBoletines(respuesta.data);
}

// =====================================================
// BUSCAR BOLETINES CON FILTROS
// =====================================================

export async function filtrarBoletines(
  filtros: FiltrosBoletines
): Promise<Boletin[]> {
  const respuesta = await api.get("/boletines", {
    params: filtros,
  });

  return extraerBoletines(respuesta.data);
}

// =====================================================
// CREAR BOLETÍN
// =====================================================

export async function crearBoletin(
  datos: CrearBoletin
): Promise<Boletin> {
  const respuesta = await api.post(
    "/boletines",
    datos
  );

  return respuesta.data?.boletin ?? respuesta.data;
}

// =====================================================
// ACTUALIZAR BOLETÍN
// =====================================================

export async function actualizarBoletin(
  idBoletin: number,
  datos: ActualizarBoletin
): Promise<Boletin> {
  const respuesta = await api.patch(
    `/boletines/${idBoletin}`,
    datos
  );

  return respuesta.data?.boletin ?? respuesta.data;
}

// =====================================================
// ELIMINAR BOLETÍN
// =====================================================

export async function eliminarBoletin(
  idBoletin: number
): Promise<void> {
  await api.delete(`/boletines/${idBoletin}`);
}
