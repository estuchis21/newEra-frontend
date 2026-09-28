import api from "../api/axios";


// ==========================================
// USUARIO
// ==========================================

export interface Usuario {
    id_usuario: number;
    nombre: string;
    apellido: string;
    dni: string;
    email: string;
    username: string;
    celular: string;
    id_rol: number;
}


// ==========================================
// LOGIN
// ==========================================

export interface LoginDto {
    email: string;
    contrasena: string;
}

export interface LoginResponse {
    statusCode: number;
    message: string;
    data: Usuario;
}

export async function login(
    dto: LoginDto
): Promise<Usuario> {

    const response =
        await api.post<LoginResponse>(
            "/alumnos/login",
            dto
        );

    return response.data.data;
}


// ==========================================
// REGISTRO
// ==========================================

export interface RegistroUsuario {
    id_usuario: number;
    nombre: string;
    apellido: string;
    dni: string;
    email: string;
    username: string;
    celular: string;
    id_rol: number;
}

export interface RegistroResponse {
    statusCode: number;
    message: string;
    data: RegistroUsuario;
}

export interface RegistroDto {

    usuario: {
        nombre: string;
        apellido: string;
        dni: string;
        email: string;
        contrasena: string;
        username: string;
        celular: string;
        id_rol: number;
    };

    es_menor: boolean | null;
}

export async function registrarAlumno(
    dto: RegistroDto
): Promise<RegistroUsuario> {

    const response =
        await api.post<RegistroResponse>(
            "/alumnos",
            dto
        );

    console.log(
        "RESPUESTA REGISTRO:",
        response.data
    );

    return response.data.data;
}


// ==========================================
// OBTENER ID DEL ALUMNO
// ==========================================

export interface ObtenerIdAlumnoResponse {
    statusCode: number;
    message: string;
    data: number | null;
}

export async function obtenerIdAlumnoPorUsuario(
    id_usuario: number
): Promise<number | null> {

    const response =
        await api.get<ObtenerIdAlumnoResponse>(
            `/alumnos/obtenerIdAlumnoPorUsuario/${id_usuario}`
        );

    console.log(
        "ID ALUMNO OBTENIDO:",
        response.data
    );

    return response.data.data;
}


// ==========================================
// OBTENER ALUMNO POR EMAIL
// ==========================================

export interface Alumno {
    id_alumno: number;
    id_usuario: number;
    nombre: string;
    apellido: string;
    email: string;
}

export interface FindAlumnoResponse {
    statusCode: number;
    message: string;
    data: Alumno | null;
}

export async function findAlumnoByEmail(
    email: string
): Promise<Alumno | null> {

    const response =
        await api.get<FindAlumnoResponse>(
            `/alumnos/findByEmail/${encodeURIComponent(email)}`
        );

    return response.data.data;
}


export const solicitarRecuperacion = async (
    email: string,
) => {

    const response =
        await api.post(
            "/alumnos/forgot-password",
            {
                email,
            },
        );

    return response.data;
};

export const restablecerContrasena = async ( token: string, nuevaContrasena: string ) => { const response = await api.post( "/alumnos/reset-password", { token, nuevaContrasena, } ); return response.data; }