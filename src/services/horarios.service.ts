
import api from "../api/axios";


// Agregar horario a un grupo
export const agregarHorarioGrupo = async ({
    idGrupo,
    diaSemana,
    horaInicio,
    horaFin,
}: {
    idGrupo: number;
    diaSemana: string;
    horaInicio: string;
    horaFin: string;
}) => {

    const response = await api.post(
        "/horarios/grupo",
        {
            idGrupo,
            diaSemana,
            horaInicio,
            horaFin,
        }
    );

    return response.data;
};


// Obtener horarios de un grupo
export const obtenerHorariosGrupo = async (idGrupo: number) => {

    const response = await api.get(
        `/horarios/grupo/${idGrupo}`
    );

    return response.data;
};

