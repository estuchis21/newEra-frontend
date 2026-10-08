import api from "../api/axios";
import type { Disciplina } from "../types/disciplina";

// Obtener todas las disciplinas

export async function obtenerDisciplinas(): Promise<Disciplina[]> {


    const response = await api.get<Disciplina[]>(
        "/disciplinas"
    );


    return response.data;

}


// Obtener una disciplina por ID

export async function obtenerDisciplina(
    id_disciplina: number
): Promise<Disciplina> {


    const response = await api.get<Disciplina>(
        `/disciplinas/${id_disciplina}`
    );


    return response.data;

}


// Crear disciplina (admin)

export async function crearDisciplina(
    disciplina: string
) {


    const response = await api.post(
        "/disciplinas/crear",
        {
            disciplina
        }
    );


    return response.data;

}