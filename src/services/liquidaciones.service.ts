
import api from "../api/axios";

// ============================================================
// TIPOS
// ============================================================

export type EstadoLiquidacion = "Pendiente" | "Pagado" | "Anulado";

export interface LiquidacionProfesor {
    id_liquidacion: number;
    id_profesor: number;
    id_cuota: number;

    monto_base: number | string;
    porcentaje: number | string;
    monto_profesor: number | string;
    monto_academia: number | string;

    fecha_generacion: string;
    estado: EstadoLiquidacion;

    mes_anio?: string;
    nombre?: string;
    apellido?: string;
}

export interface ResumenLiquidacionesProfesor {
    total_liquidaciones: number;
    total_profesor: number;
    total_pendiente: number;
    total_pagado: number;
}

// ============================================================
// NORMALIZACIÓN
// ============================================================

const normalizarLiquidaciones = (
    respuesta: unknown,
): LiquidacionProfesor[] => {
    let datos = respuesta;

    // Permite respuestas del tipo { data: [...] }.
    if (
        datos &&
        typeof datos === "object" &&
        !Array.isArray(datos) &&
        "data" in datos
    ) {
        datos = (datos as { data: unknown }).data;
    }

    if (!Array.isArray(datos)) {
        return [];
    }

    return datos as LiquidacionProfesor[];
};

// ============================================================
// OBTENER LIQUIDACIONES DE UN PROFESOR
// ============================================================

export const obtenerLiquidacionesProfesor = async (
    idProfesor: number,
): Promise<LiquidacionProfesor[]> => {
    if (!Number.isInteger(idProfesor) || idProfesor <= 0) {
        throw new Error("El ID del profesor no es válido.");
    }

    const respuesta = await api.get(
        `/liquidaciones-profesores/profesor/${idProfesor}`,
    );

    return normalizarLiquidaciones(respuesta.data);
};

// ============================================================
// OBTENER UNA LIQUIDACIÓN
// ============================================================

export const obtenerLiquidacionProfesorPorId = async (
    idLiquidacion: number,
): Promise<LiquidacionProfesor> => {
    if (!Number.isInteger(idLiquidacion) || idLiquidacion <= 0) {
        throw new Error("El ID de la liquidación no es válido.");
    }

    const respuesta = await api.get(
        `/liquidaciones-profesores/${idLiquidacion}`,
    );

    const datos = respuesta.data?.data ?? respuesta.data;

    return datos as LiquidacionProfesor;
};

