import api from "../api/axios";

// =====================================================
// INTERFACES
// =====================================================

export interface HorarioGrupo {
    id_horario: number;
    dia_semana: string;
    hora_inicio: string;
    hora_fin: string;
}

export interface Grupo {
    id_grupo: number;
    id_disciplina: number;
    disciplina: string;
    nivel: string;
    cupo_max: number;
    activo: boolean;

    id_inscripcion?: number;

    profesor?: string;

    dia_semana?: string;
    hora_inicio?: string;
    hora_fin?: string;

    horarios?: HorarioGrupo[];
}

export interface Clase {
    id_clase: number;
    id_grupo: number;
    id_tipo_clase?: number;
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
    estado: string;

    disciplina?: string;
    nivel?: string;
}

export interface AlumnoClase {
    id_alumno: number;
    nombre: string;
    apellido: string;
    dni?: string;
}

// =====================================================
// ALUMNO
// =====================================================

// Obtener los grupos en los que está inscripto un alumno
export const obtenerGruposAlumno = async (
    idAlumno: number
): Promise<Grupo[]> => {

    const response = await api.get<Grupo[]>(
        `/grupos/alumno/${idAlumno}`
    );

    return response.data;
};


// =====================================================
// OBTENER GRUPOS DISPONIBLES
// =====================================================

export const obtenerGruposDisponibles = async (): Promise<Grupo[]> => {

    const response = await api.get<Grupo[]>(
        "/grupos/disponibles"
    );

    return response.data;
};


// =====================================================
// INSCRIBIRSE A UN GRUPO
// =====================================================

export const inscribirseGrupo = async (
    idAlumno: number,
    idGrupo: number
) => {

    const response = await api.post(
        "/inscripciones",
        {
            idAlumno,
            idGrupo,
        }
    );

    return response.data;
};

export const eliminarInscripcion = async (
    idInscripcion: number
) => {

    const response = await api.delete(
        `/inscripciones/${idInscripcion}`
    );

    return response.data;
};


// =====================================================
// PROFESOR
// =====================================================

// Obtener grupos de un profesor
export const obtenerGruposProfesor = async (
    idProfesor: number
): Promise<Grupo[]> => {

    const response = await api.get<Grupo[]>(
        `/grupos/profesor/${idProfesor}`
    );

    return response.data;
};


// Obtener clases de un profesor
export const obtenerClasesProfesor = async (
    idProfesor: number,
    fecha?: string
): Promise<Clase[]> => {

    const response = await api.get<Clase[]>(
        `/grupos/profesor/${idProfesor}/clases`,
        {
            params: {
                fecha,
            },
        }
    );

    return response.data;
};


// Obtener alumnos de una clase
export const obtenerAlumnosPorClase = async (
    idClase: number
): Promise<AlumnoClase[]> => {

    const response = await api.get<AlumnoClase[]>(
        `/grupos/clase/${idClase}/alumnos`
    );

    return response.data;
};


// =====================================================
// CLASES
// =====================================================

// Obtener todas las clases
export const obtenerTodasLasClases = async (): Promise<Clase[]> => {

    const response = await api.get<Clase[]>(
        "/grupos/clases"
    );

    return response.data;
};


// Obtener una clase por ID
export const obtenerClasePorId = async (
    idClase: number
): Promise<Clase> => {

    const response = await api.get<Clase>(
        `/grupos/clases/${idClase}`
    );

    return response.data;
};
