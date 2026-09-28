
import api from "../api/axios";


// Obtener todas las clases
export const obtenerClases = async () => {

    const response = await api.get(
        "/clases"
    );

    return response.data;
};


// Obtener clase por ID
export const obtenerClase = async (idClase: number) => {

    const response = await api.get(
        `/clases/${idClase}`
    );

    return response.data;
};


// Obtener clases de un grupo
export const obtenerClasesGrupo = async (idGrupo: number) => {

    const response = await api.get(
        `/clases/grupo/${idGrupo}`
    );

    return response.data;
};
