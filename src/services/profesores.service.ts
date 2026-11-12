import api from "../api/axios";

export interface Profesor {
    id_profesor: number;
    id_usuario: number;
}

export interface CuentaMP {
    alias_mp: string;
}

export const obtenerProfesorPorUsuario = async (
    idUsuario: number
): Promise<Profesor | null> => {
    const response = await api.get<Profesor>(
        `/profesores/usuario/${idUsuario}`
    );

    return response.data;
};

export const obtenerMiCuentaMP = async (): Promise<CuentaMP> => {
    const response = await api.get<CuentaMP>(
        "/profesores/mi-cuenta-mp"
    );

    return response.data;
};

export const guardarMiAliasMP = async (
    aliasMP: string
): Promise<CuentaMP> => {
    const response = await api.patch<CuentaMP>(
        "/profesores/mi-cuenta-mp",
        { alias_mp: aliasMP }
    );

    return response.data;
};