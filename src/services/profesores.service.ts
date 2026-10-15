import api from "../api/axios";

export interface Profesor {
    id_profesor: number;
    id_usuario: number;
}

export const obtenerProfesorPorUsuario = async (
    idUsuario: number
): Promise<Profesor | null> => {
    const response = await api.get<Profesor>(
        `/profesores/usuario/${idUsuario}`
    );

    console.log("RESPUESTA PROFESOR:", response.data);

    return response.data;
};