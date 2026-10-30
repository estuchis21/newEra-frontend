
import api from '../api/axios';

// ============================================================
// TIPOS
// ============================================================

export interface PersonaAutorizada {
    id_autorizada: number;
    id_alumno: number;

    nombre: string;
    apellido: string;
    dni: string;

    parentesco: string | null;
    telefono: string | null;

    activo: boolean;

    nombre_alumno?: string;
    apellido_alumno?: string;
}

export interface CrearPersonaAutorizada {
    id_alumno: number;

    nombre: string;
    apellido: string;
    dni: string;

    parentesco?: string;
    telefono?: string;
}

export interface ActualizarPersonaAutorizada {
    nombre?: string;
    apellido?: string;
    dni?: string;
    parentesco?: string;
    telefono?: string;
}

export interface RegistrarRetiro {
    id_alumno: number;
    id_autorizada: number;
    id_profesor: number;
    observaciones?: string;
}

export interface RetiroMenor {
    id_retiro: number;

    fecha_hora: string;

    id_alumno: number;
    nombre_alumno: string;
    apellido_alumno: string;
    dni_alumno?: string;

    id_autorizada?: number;
    nombre_autorizado: string;
    apellido_autorizado: string;
    dni_autorizado: string;
    parentesco: string | null;

    id_profesor: number;
    nombre_profesor: string;
    apellido_profesor: string;

    observaciones: string | null;
}

export interface RespuestaRegistrarRetiro {
    mensaje: string;
    retiro: RetiroMenor;
}

export interface PlanillaRetiro {
    titulo: string;
    academia: string;
    retiro: RetiroMenor;
}

// ============================================================
// PERSONAS AUTORIZADAS
// ============================================================

/**
 * Registrar una persona autorizada para retirar a un alumno.
 */
export const crearPersonaAutorizada = async (
    data: CrearPersonaAutorizada,
): Promise<{
    mensaje: string;
    persona: PersonaAutorizada;
}> => {
    const response = await api.post(
        '/retiros/personas-autorizadas',
        data,
    );

    return response.data;
};

/**
 * Obtener todas las personas autorizadas de un alumno.
 */
export const obtenerPersonasAutorizadas = async (
    idAlumno: number,
): Promise<PersonaAutorizada[]> => {
    const response = await api.get(
        `/retiros/personas-autorizadas/alumno/${idAlumno}`,
    );

    return response.data;
};

/**
 * Obtener una persona autorizada por su ID.
 */
export const obtenerPersonaAutorizada = async (
    idAutorizada: number,
): Promise<PersonaAutorizada> => {
    const response = await api.get(
        `/retiros/personas-autorizadas/${idAutorizada}`,
    );

    return response.data;
};

/**
 * Actualizar los datos de una persona autorizada.
 */
export const actualizarPersonaAutorizada = async (
    idAutorizada: number,
    data: ActualizarPersonaAutorizada,
): Promise<{
    mensaje: string;
    persona: PersonaAutorizada;
}> => {
    const response = await api.patch(
        `/retiros/personas-autorizadas/${idAutorizada}`,
        data,
    );

    return response.data;
};

/**
 * Desactivar una autorización.
 * No elimina físicamente el registro.
 */
export const desactivarPersonaAutorizada = async (
    idAutorizada: number,
): Promise<{
    mensaje: string;
    id_autorizada: number;
}> => {
    const response = await api.delete(
        `/retiros/personas-autorizadas/${idAutorizada}`,
    );

    return response.data;
};

// ============================================================
// RETIROS DE MENORES
// ============================================================

/**
 * Registrar la entrega de un menor a una persona autorizada.
 */
export const registrarRetiro = async (
    data: RegistrarRetiro,
): Promise<RespuestaRegistrarRetiro> => {
    const response = await api.post(
        '/retiros',
        data,
    );

    return response.data;
};

/**
 * Obtener el historial de retiros.
 * Permite filtrar por alumno o profesor.
 */
export const obtenerHistorialRetiros = async (
    filtros?: {
        id_alumno?: number;
        id_profesor?: number;
    },
): Promise<RetiroMenor[]> => {
    const response = await api.get(
        '/retiros/historial',
        {
            params: filtros,
        },
    );

    return response.data;
};

/**
 * Obtener la información de un retiro y su planilla.
 */
export const obtenerPlanillaRetiro = async (
    idRetiro: number,
): Promise<PlanillaRetiro> => {
    const response = await api.get(
        `/retiros/${idRetiro}/planilla`,
    );

    return response.data;
};

/**
 * Obtener un retiro individual.
 */
export const obtenerRetiroPorId = async (
    idRetiro: number,
): Promise<PlanillaRetiro> => {
    const response = await api.get(
        `/retiros/${idRetiro}`,
    );

    return response.data;
};
