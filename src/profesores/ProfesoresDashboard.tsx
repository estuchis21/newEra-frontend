
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import { obtenerProfesorPorUsuario } from "../services/profesores.service";
import {
    crearGrupo,
    obtenerAlumnosPorClase,
    obtenerClasesProfesor,
    obtenerGruposProfesor,
    obtenerAlumnosPorGrupo,
    type AlumnoClase,
    type Clase,
    type Grupo,
} from "../services/grupos.service";
import {
    obtenerAsistenciaAlumnoClase,
    registrarAsistencia,
    type Asistencia,
} from "../services/asistencia.service";
import { obtenerDisciplinas } from "../services/disciplinas.service";
import { obtenerHorariosGrupo } from "../services/horarios.service";

import "./ProfesoresDashboard.css";

type Seccion =
    | "inicio"
    | "grupos"
    | "clases"
    | "alumnos"
    | "asistencias"
    | "liquidaciones"
    | "perfil";

type ErrorHttp = {
    message?: string;
    response?: {
        status?: number;
        data?: {
            message?: unknown;
            error?: unknown;
            errors?: unknown;
            details?: unknown;
        };
    };
};

const esIdValido = (valor: unknown): valor is number =>
    typeof valor === "number" &&
    Number.isInteger(valor) &&
    valor > 0;

/**
 * Extrae la asistencia independientemente de si el servicio
 * devuelve directamente el objeto o una respuesta con data.
 */

const extraerAsistencia = (respuesta: unknown): Asistencia | null => {
    if (Array.isArray(respuesta)) {
        return respuesta.length > 0
            ? extraerAsistencia(respuesta[0])
            : null;
    }

    if (
        typeof respuesta !== "object" ||
        respuesta === null
    ) {
        return null;
    }

    const objeto = respuesta as Record<string, unknown>;

    // Algunas respuestas del backend vienen dentro de "data".
    if ("data" in objeto) {
        return extraerAsistencia(objeto.data);
    }

    const idAsistencia = Number(objeto.id_asistencia);
    const idAlumno = Number(objeto.id_alumno);
    const idClase = Number(objeto.id_clase);
    const estado = objeto.estado;

    // Validar los campos obligatorios de la asistencia.
    if (
        !Number.isInteger(idAsistencia) ||
        idAsistencia <= 0 ||
        !Number.isInteger(idAlumno) ||
        idAlumno <= 0 ||
        !Number.isInteger(idClase) ||
        idClase <= 0 ||
        (estado !== "presente" && estado !== "ausente")
    ) {
        return null;
    }

    return {
        ...objeto,
        id_asistencia: idAsistencia,
        id_alumno: idAlumno,
        id_clase: idClase,
        estado,
    } as Asistencia;
};

/**
 * Interpreta los errores habituales de Axios y NestJS.
 * Prioriza los mensajes enviados por el backend.
 */
const obtenerMensajeError = (
    error: unknown,
    mensajePredeterminado: string,
): string => {
    const errorHttp = error as ErrorHttp;
    const data = errorHttp?.response?.data;

    const mensajes: string[] = [];

    const agregarMensaje = (valor: unknown): void => {
        if (typeof valor === "string" && valor.trim()) {
            mensajes.push(valor.trim());
            return;
        }

        if (Array.isArray(valor)) {
            valor.forEach(agregarMensaje);
            return;
        }

        if (valor && typeof valor === "object") {
            const objeto = valor as Record<string, unknown>;

            if (typeof objeto.message === "string") {
                agregarMensaje(objeto.message);
            } else if (typeof objeto.msg === "string") {
                agregarMensaje(objeto.msg);
            }
        }
    };

    agregarMensaje(data?.message);
    agregarMensaje(data?.errors);
    agregarMensaje(data?.details);

    const mensajesUnicos = [...new Set(mensajes)];

    if (mensajesUnicos.length > 0) {
        return mensajesUnicos.join("\n");
    }

    if (typeof data?.error === "string") {
        const errorBackend = data.error.trim();

        if (
            errorBackend &&
            errorBackend !== "Bad Request" &&
            errorBackend !== "Internal Server Error"
        ) {
            return errorBackend;
        }
    }

    switch (errorHttp?.response?.status) {
        case 400:
            return "Los datos enviados no son válidos. Revisá los campos e intentá nuevamente.";

        case 401:
            return "Tu sesión no es válida o expiró. Iniciá sesión nuevamente.";

        case 403:
            return "No tenés permisos para realizar esta acción.";

        case 404:
            return "No se encontró el recurso solicitado.";

        case 409:
            return "Existe un conflicto con los datos enviados. Verificá si el registro ya existe.";

        case 422:
            return "El servidor no pudo procesar los datos enviados.";

        case 500:
            return "Ocurrió un error interno en el servidor.";

        default:
            return errorHttp?.message || mensajePredeterminado;
    }
};

const ProfesorDashboard = () => {
    const navigate = useNavigate();

    // USUARIO
    const [usuario, setUsuario] = useState<any>(null);

    // PROFESOR
    const [profesor, setProfesor] = useState<any>(null);
    const [idProfesor, setIdProfesor] = useState<number | null>(null);
    const [loadingProfesor, setLoadingProfesor] = useState(true);
    const [errorProfesor, setErrorProfesor] = useState("");

    // SECCIÓN
    const [seccion, setSeccion] = useState<Seccion>("inicio");

    // GRUPOS
    const [grupos, setGrupos] = useState<Grupo[]>([]);
    const [loadingGrupos, setLoadingGrupos] = useState(false);
    const [errorGrupos, setErrorGrupos] = useState("");

    // CREAR GRUPO
    const [mostrarFormularioGrupo, setMostrarFormularioGrupo] =
        useState(false);
    const [creandoGrupo, setCreandoGrupo] = useState(false);

    const [nuevoGrupo, setNuevoGrupo] = useState({
        id_disciplina: 1,
        nivel: "Principiante",
        cupo_max: 20,
        dia_semana: "lunes",
        hora_inicio: "18:00",
        hora_fin: "19:00",
    });

    // DISCIPLINAS
    const [disciplinas, setDisciplinas] = useState<any[]>([]);
    const [loadingDisciplinas, setLoadingDisciplinas] = useState(false);

    // CLASES
    const [clases, setClases] = useState<Clase[]>([]);
    const [loadingClases, setLoadingClases] = useState(false);
    const [errorClases, setErrorClases] = useState("");

    // CLASE SELECCIONADA
    const [claseSeleccionada, setClaseSeleccionada] =
        useState<number | null>(null);

    // ALUMNOS
    const [alumnos, setAlumnos] = useState<AlumnoClase[]>([]);
    const [loadingAlumnos, setLoadingAlumnos] = useState(false);
    const [errorAlumnos, setErrorAlumnos] = useState("");

    // ASISTENCIAS
    const [asistencias, setAsistencias] = useState<
        Record<number, Asistencia | null>
    >({});

    const [loadingAsistencias, setLoadingAsistencias] = useState(false);

    const [guardandoAsistencia, setGuardandoAsistencia] =
        useState<number | null>(null);

    // HORARIOS
    const [horariosGrupo, setHorariosGrupo] = useState<
        Record<number, any[]>
    >({});

    const [loadingHorarios, setLoadingHorarios] = useState(false);

    // ALUMNOS POR GRUPO
    const [alumnosPorGrupo, setAlumnosPorGrupo] = useState<
        Record<number, AlumnoClase[]>
    >({});

    const [loadingAlumnosGrupos, setLoadingAlumnosGrupos] =
        useState(false);

    // ALERTAS
    const mostrarExito = async (
        titulo: string,
        texto: string,
    ): Promise<void> => {
        await Swal.fire({
            icon: "success",
            title: titulo,
            text: texto,
            confirmButtonText: "Aceptar",
        });
    };

    const mostrarError = async (
        titulo: string,
        texto: string,
    ): Promise<void> => {
        await Swal.fire({
            icon: "error",
            title: titulo,
            text: texto,
            confirmButtonText: "Aceptar",
            confirmButtonColor: "#d33",
        });
    };

    // OBTENER USUARIO
    const obtenerIdUsuario = (): number | null => {
        const usuarioGuardado = localStorage.getItem("usuario");

        if (!usuarioGuardado) {
            return null;
        }

        try {
            const usuarioParseado = JSON.parse(usuarioGuardado);

            setUsuario(usuarioParseado);

            const id =
                usuarioParseado.id_usuario ??
                usuarioParseado.idUsuario ??
                usuarioParseado.id;

            const idNumero = Number(id);

            if (!esIdValido(idNumero)) {
                return null;
            }

            return idNumero;
        } catch (error) {
            console.error("Error leyendo usuario:", error);
            return null;
        }
    };

    // CERRAR SESIÓN
    const cerrarSesion = (): void => {
        localStorage.removeItem("usuario");
        localStorage.removeItem("token");
        navigate("/login");
    };

    // CARGAR PROFESOR
    const cargarProfesor = async (): Promise<void> => {
        try {
            setLoadingProfesor(true);
            setErrorProfesor("");

            const idUsuario = obtenerIdUsuario();

            if (!idUsuario) {
                setErrorProfesor(
                    "No se pudo obtener el usuario. Iniciá sesión nuevamente.",
                );

                setIdProfesor(null);
                return;
            }

            const datos = await obtenerProfesorPorUsuario(idUsuario);

            console.log("PROFESOR OBTENIDO:", datos);

            setProfesor(datos);

            const id = Number(datos?.id_profesor);

            if (esIdValido(id)) {
                setIdProfesor(id);
            } else {
                setIdProfesor(null);
                setErrorProfesor(
                    "No se pudo obtener el ID del profesor.",
                );
            }
        } catch (error: unknown) {
            console.error("Error obteniendo profesor:", error);

            setErrorProfesor(
                obtenerMensajeError(
                    error,
                    "No se pudo cargar la información del profesor.",
                ),
            );
        } finally {
            setLoadingProfesor(false);
        }
    };

    // CARGAR DISCIPLINAS
    const cargarDisciplinas = async (): Promise<void> => {
        try {
            setLoadingDisciplinas(true);

            const datos = await obtenerDisciplinas();

            console.log("DISCIPLINAS:", datos);

            setDisciplinas(Array.isArray(datos) ? datos : []);
        } catch (error: unknown) {
            console.error("Error obteniendo disciplinas:", error);

            setDisciplinas([]);

            await mostrarError(
                "Error al cargar disciplinas",
                obtenerMensajeError(
                    error,
                    "No se pudieron cargar las disciplinas.",
                ),
            );
        } finally {
            setLoadingDisciplinas(false);
        }
    };

    // CARGAR GRUPOS
    const cargarGrupos = async (): Promise<void> => {
        if (!idProfesor) return;

        try {
            setLoadingGrupos(true);
            setErrorGrupos("");

            const datos = await obtenerGruposProfesor(idProfesor);

            console.log("GRUPOS DEL PROFESOR:", datos);

            setGrupos(Array.isArray(datos) ? datos : []);
        } catch (error: unknown) {
            console.error("Error obteniendo grupos:", error);

            const mensaje = obtenerMensajeError(
                error,
                "No se pudieron cargar tus grupos.",
            );

            setErrorGrupos(mensaje);
            setGrupos([]);
        } finally {
            setLoadingGrupos(false);
        }
    };

    // CARGAR CLASES
    const cargarClases = async (): Promise<void> => {
        if (!idProfesor) return;

        try {
            setLoadingClases(true);
            setErrorClases("");

            const datos = await obtenerClasesProfesor(idProfesor);

            console.log("CLASES DEL PROFESOR:", datos);

            setClases(Array.isArray(datos) ? datos : []);
        } catch (error: unknown) {
            console.error("Error obteniendo clases:", error);

            const mensaje = obtenerMensajeError(
                error,
                "No se pudieron cargar tus clases.",
            );

            setErrorClases(mensaje);
            setClases([]);
        } finally {
            setLoadingClases(false);
        }
    };

    // CARGAR HORARIOS DE LOS GRUPOS
    const cargarHorariosGrupos = async (): Promise<void> => {
        if (grupos.length === 0) {
            setHorariosGrupo({});
            return;
        }

        try {
            setLoadingHorarios(true);

            const resultados = await Promise.all(
                grupos.map(async (grupo) => {
                    try {
                        const horarios = await obtenerHorariosGrupo(
                            grupo.id_grupo,
                        );

                        return {
                            idGrupo: grupo.id_grupo,
                            horarios: Array.isArray(horarios)
                                ? horarios
                                : [],
                        };
                    } catch (error: unknown) {
                        console.error(
                            `Error obteniendo horarios del grupo ${grupo.id_grupo}:`,
                            error,
                        );

                        return {
                            idGrupo: grupo.id_grupo,
                            horarios: [],
                        };
                    }
                }),
            );

            const mapa: Record<number, any[]> = {};

            resultados.forEach((resultado) => {
                mapa[resultado.idGrupo] = resultado.horarios;
            });

            setHorariosGrupo(mapa);
        } finally {
            setLoadingHorarios(false);
        }
    };

    // CARGAR ALUMNOS DE LOS GRUPOS
    const cargarAlumnosGrupos = async (): Promise<void> => {
        if (grupos.length === 0) {
            setAlumnosPorGrupo({});
            return;
        }

        try {
            setLoadingAlumnosGrupos(true);

            const resultados = await Promise.all(
                grupos.map(async (grupo) => {
                    try {
                        const alumnosGrupo = await obtenerAlumnosPorGrupo(
                            Number(grupo.id_grupo),
                        );

                        console.log(
                            `Alumnos del grupo ${grupo.id_grupo}:`,
                            alumnosGrupo,
                        );

                        return {
                            idGrupo: Number(grupo.id_grupo),
                            alumnos: Array.isArray(alumnosGrupo)
                                ? alumnosGrupo
                                : [],
                        };
                    } catch (error: unknown) {
                        console.error(
                            `Error obteniendo alumnos del grupo ${grupo.id_grupo}:`,
                            error,
                        );

                        return {
                            idGrupo: Number(grupo.id_grupo),
                            alumnos: [],
                        };
                    }
                }),
            );

            const mapa: Record<number, AlumnoClase[]> = {};

            resultados.forEach(({ idGrupo, alumnos }) => {
                mapa[idGrupo] = alumnos;
            });

            console.log("Mapa de alumnos por grupo:", mapa);

            setAlumnosPorGrupo(mapa);
        } finally {
            setLoadingAlumnosGrupos(false);
        }
    };

    // CARGAR ALUMNOS Y ASISTENCIAS DE UNA CLASE
    const cargarAlumnosClase = async (
        idClase: number,
    ): Promise<void> => {
        if (!esIdValido(Number(idClase))) {
            await mostrarError(
                "Error",
                "El ID de la clase no es válido.",
            );
            return;
        }

        try {
            setLoadingAlumnos(true);
            setLoadingAsistencias(true);
            setErrorAlumnos("");
            setClaseSeleccionada(Number(idClase));

            // Evitar mezclar datos de dos clases diferentes.
            setAlumnos([]);
            setAsistencias({});

            const data = await obtenerAlumnosPorClase(Number(idClase));
            const alumnosClase: AlumnoClase[] = Array.isArray(data)
                ? data
                : [];

            console.log("ALUMNOS DE LA CLASE:", alumnosClase);

            setAlumnos(alumnosClase);

            const resultados = await Promise.all(
                alumnosClase.map(async (alumno) => {
                    const idAlumno = Number(alumno.id_alumno);

                    if (!esIdValido(idAlumno)) {
                        return {
                            idAlumno: 0,
                            asistencia: null,
                            error: null,
                        };
                    }

                    try {
                        const respuesta =
                            await obtenerAsistenciaAlumnoClase(
                                idAlumno,
                                Number(idClase),
                            );

                        return {
                            idAlumno,
                            asistencia: extraerAsistencia(respuesta),
                            error: null,
                        };
                    } catch (error: unknown) {
                        console.error(
                            `Error obteniendo asistencia del alumno ${idAlumno}:`,
                            error,
                        );

                        return {
                            idAlumno,
                            asistencia: null,
                            error,
                        };
                    }
                }),
            );

            const mapa: Record<number, Asistencia | null> = {};
            const erroresConsulta: string[] = [];

            resultados.forEach((resultado) => {
                if (resultado.idAlumno > 0) {
                    mapa[resultado.idAlumno] = resultado.asistencia;
                }

                if (resultado.error) {
                    erroresConsulta.push(
                        obtenerMensajeError(
                            resultado.error,
                            `No se pudo consultar la asistencia del alumno ${resultado.idAlumno}.`,
                        ),
                    );
                }
            });

            setAsistencias(mapa);

            // No ocultar fallos de las consultas de asistencia.
            if (erroresConsulta.length > 0) {
                const erroresUnicos = [
                    ...new Set(erroresConsulta),
                ];

                setErrorAlumnos(
                    `No se pudieron consultar algunas asistencias:\n${erroresUnicos.join("\n")}`,
                );
            }
        } catch (error: unknown) {
            console.error("Error obteniendo alumnos:", error);

            const mensaje = obtenerMensajeError(
                error,
                "No se pudieron cargar los alumnos de esta clase.",
            );

            setErrorAlumnos(mensaje);

            await mostrarError(
                "Error al cargar la clase",
                mensaje,
            );
        } finally {
            setLoadingAlumnos(false);
            setLoadingAsistencias(false);
        }
    };

    // REGISTRAR ASISTENCIA
    const guardarAsistencia = async (
        idAlumno: number,
        idClase: number,
        estado: string,
    ): Promise<void> => {
        const alumnoId = Number(idAlumno);
        const claseId = Number(idClase);

        if (!esIdValido(alumnoId)) {
            await mostrarError(
                "Error",
                "El ID del alumno debe ser un número entero mayor que 0.",
            );
            return;
        }

        if (!esIdValido(claseId)) {
            await mostrarError(
                "Error",
                "El ID de la clase debe ser un número entero mayor que 0.",
            );
            return;
        }

        if (!["presente", "ausente"].includes(estado)) {
            await mostrarError(
                "Error",
                "El estado de asistencia no es válido.",
            );
            return;
        }

        // No duplicar una asistencia que ya existe.
        if (asistencias[alumnoId]) {
            await mostrarError(
                "Asistencia existente",
                "Este alumno ya tiene una asistencia registrada para la clase.",
            );
            return;
        }

        // Evitar peticiones simultáneas.
        if (guardandoAsistencia !== null) {
            return;
        }

        try {
            setGuardandoAsistencia(alumnoId);

            await registrarAsistencia({
                id_alumno: alumnoId,
                id_clase: claseId,
                estado,
                observaciones: "",
            });

            // Consultar el registro guardado en el backend.
            const respuesta = await obtenerAsistenciaAlumnoClase(
                alumnoId,
                claseId,
            );

            const asistenciaGuardada = extraerAsistencia(respuesta);

            if (asistenciaGuardada) {
                setAsistencias((anteriores) => ({
                    ...anteriores,
                    [alumnoId]: asistenciaGuardada,
                }));
            } else {
                // Si no se encuentra, recargar los datos de la clase.
                await cargarAlumnosClase(claseId);
            }

            await mostrarExito(
                "Asistencia registrada",
                `El alumno fue marcado como ${
                    estado === "presente" ? "presente" : "ausente"
                }.`,
            );
        } catch (error: unknown) {
            console.error("Error registrando asistencia:", error);

            await mostrarError(
                "No se pudo registrar la asistencia",
                obtenerMensajeError(
                    error,
                    "No se pudo registrar la asistencia.",
                ),
            );
        } finally {
            setGuardandoAsistencia(null);
        }
    };

    // CAMBIAR DATOS DEL GRUPO
    const cambiarDatoGrupo = (
        campo: string,
        valor: string | number,
    ): void => {
        setNuevoGrupo((anterior) => ({
            ...anterior,
            [campo]: valor,
        }));
    };

    // CREAR GRUPO
    const ejecutarCrearGrupo = async (): Promise<void> => {
        if (!idProfesor || !esIdValido(idProfesor)) {
            await mostrarError(
                "Error",
                "No se pudo obtener el ID del profesor.",
            );
            return;
        }

        if (!esIdValido(Number(nuevoGrupo.id_disciplina))) {
            await mostrarError(
                "Error",
                "Seleccioná una disciplina válida.",
            );
            return;
        }

        if (!nuevoGrupo.nivel.trim()) {
            await mostrarError(
                "Error",
                "Ingresá el nivel del grupo.",
            );
            return;
        }

        if (
            !Number.isInteger(Number(nuevoGrupo.cupo_max)) ||
            Number(nuevoGrupo.cupo_max) <= 0
        ) {
            await mostrarError(
                "Error",
                "El cupo máximo debe ser un número entero mayor que 0.",
            );
            return;
        }

        if (!nuevoGrupo.dia_semana) {
            await mostrarError(
                "Error",
                "Seleccioná un día.",
            );
            return;
        }

        if (
            !nuevoGrupo.hora_inicio ||
            !nuevoGrupo.hora_fin
        ) {
            await mostrarError(
                "Error",
                "Ingresá el horario completo.",
            );
            return;
        }

        if (nuevoGrupo.hora_inicio >= nuevoGrupo.hora_fin) {
            await mostrarError(
                "Error",
                "La hora de inicio debe ser anterior a la hora de finalización.",
            );
            return;
        }

        try {
            setCreandoGrupo(true);

            const datosGrupo = {
                id_disciplina: Number(nuevoGrupo.id_disciplina),
                nivel: nuevoGrupo.nivel.trim(),
                cupo_max: Number(nuevoGrupo.cupo_max),
                id_profesor: idProfesor,
                horarios: [
                    {
                        dia_semana: nuevoGrupo.dia_semana,
                        hora_inicio: nuevoGrupo.hora_inicio,
                        hora_fin: nuevoGrupo.hora_fin,
                    },
                ],
            };

            console.log("CREANDO GRUPO:", datosGrupo);

            await crearGrupo(datosGrupo);

            setMostrarFormularioGrupo(false);

            setNuevoGrupo({
                id_disciplina: Number(
                    disciplinas[0]?.id_disciplina ?? 1,
                ),
                nivel: "Principiante",
                cupo_max: 20,
                dia_semana: "lunes",
                hora_inicio: "18:00",
                hora_fin: "19:00",
            });

            await cargarGrupos();

            await mostrarExito(
                "Grupo creado",
                "El grupo fue creado correctamente.",
            );
        } catch (error: unknown) {
            console.error("ERROR CREANDO GRUPO:", error);

            await mostrarError(
                "No se pudo crear el grupo",
                obtenerMensajeError(
                    error,
                    "No se pudo crear el grupo.",
                ),
            );
        } finally {
            setCreandoGrupo(false);
        }
    };

    // ESTADÍSTICAS
    const totalAlumnos = useMemo(() => {
        const ids = new Set<number>();

        Object.values(alumnosPorGrupo).forEach((lista) => {
            lista.forEach((alumno) => {
                const idAlumno = Number(alumno.id_alumno);

                if (esIdValido(idAlumno)) {
                    ids.add(idAlumno);
                }
            });
        });

        return ids.size;
    }, [alumnosPorGrupo]);

    const totalPresentes = useMemo(
        () =>
            Object.values(asistencias).filter(
                (asistencia) =>
                    asistencia?.estado === "presente",
            ).length,
        [asistencias],
    );

    const totalAusentes = useMemo(
        () =>
            Object.values(asistencias).filter(
                (asistencia) =>
                    asistencia?.estado === "ausente",
            ).length,
        [asistencias],
    );

    const totalRegistradas =
        totalPresentes + totalAusentes;

    const porcentajeAsistencia =
        totalRegistradas > 0
            ? Math.round(
                  (totalPresentes / totalRegistradas) * 100,
              )
            : 0;

    const claseActual = clases.find(
        (clase) =>
            Number(clase.id_clase) ===
            Number(claseSeleccionada),
    );

    // CAMBIAR SECCIÓN
    const cambiarSeccion = (
        nuevaSeccion: Seccion,
    ): void => {
        setSeccion(nuevaSeccion);

        if (
            nuevaSeccion !== "clases" &&
            nuevaSeccion !== "asistencias"
        ) {
            setClaseSeleccionada(null);
            setAlumnos([]);
            setAsistencias({});
            setErrorAlumnos("");
        }
    };

    // EFECTO INICIAL
    useEffect(() => {
        void cargarProfesor();
        void cargarDisciplinas();
    }, []);

    // CUANDO TENEMOS PROFESOR
    useEffect(() => {
        if (!idProfesor) return;

        void cargarGrupos();
        void cargarClases();
    }, [idProfesor]);

    // CUANDO CAMBIAN LOS GRUPOS
    useEffect(() => {
        if (grupos.length === 0) {
            setHorariosGrupo({});
            return;
        }

        void cargarHorariosGrupos();
    }, [grupos]);

    // CUANDO TENEMOS GRUPOS Y CLASES
    useEffect(() => {
        if (grupos.length === 0 || clases.length === 0) {
            setAlumnosPorGrupo({});
            return;
        }

        void cargarAlumnosGrupos();
    }, [grupos, clases]);

    // LOADING
    if (loadingProfesor) {
        return (
            <div className="profesor-dashboard">
                <div className="loading">
                    Cargando dashboard...
                </div>
            </div>
        );
    }

    // RENDER
    return (
        <div className="profesor-dashboard">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2>Academia</h2>
                    <span>Panel de profesor</span>
                </div>

                <nav className="sidebar-nav">
                    <button
                        className={seccion === "inicio" ? "active" : ""}
                        onClick={() => cambiarSeccion("inicio")}
                    >
                        🏠 Inicio
                    </button>

                    <button
                        className={seccion === "grupos" ? "active" : ""}
                        onClick={() => cambiarSeccion("grupos")}
                    >
                        👥 Mis grupos
                    </button>

                    <button
                        className={seccion === "clases" ? "active" : ""}
                        onClick={() => cambiarSeccion("clases")}
                    >
                        📚 Mis clases
                    </button>

                    <button
                        className={seccion === "alumnos" ? "active" : ""}
                        onClick={() => cambiarSeccion("alumnos")}
                    >
                        🎓 Mis alumnos
                    </button>

                    <button
                        className={seccion === "asistencias" ? "active" : ""}
                        onClick={() => cambiarSeccion("asistencias")}
                    >
                        ✅ Asistencias
                    </button>

                    <button
                        className={seccion === "liquidaciones" ? "active" : ""}
                        onClick={() => cambiarSeccion("liquidaciones")}
                    >
                        💰 Liquidaciones
                    </button>

                    <button
                        className={seccion === "perfil" ? "active" : ""}
                        onClick={() => cambiarSeccion("perfil")}
                    >
                        👤 Mi perfil
                    </button>
                </nav>

                <div className="sidebar-footer">
                    <button
                        className="logout-button"
                        onClick={cerrarSesion}
                    >
                        🚪 Cerrar sesión
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <header className="dashboard-header">
                    <div>
                        <span className="section-label">
                            PANEL DE PROFESOR
                        </span>

                        <h1>
                            {profesor?.nombre
                                ? `Hola, ${profesor.nombre}`
                                : "Panel del profesor"}
                        </h1>
                    </div>

                    <div className="header-user">
                        <div className="user-avatar">
                            {profesor?.nombre
                                ?.charAt(0)
                                ?.toUpperCase() ?? "P"}
                        </div>

                        <div>
                            <strong>
                                {profesor?.nombre} {profesor?.apellido}
                            </strong>
                            <span>Profesor</span>
                        </div>
                    </div>
                </header>

                {/* INICIO */}
                {seccion === "inicio" && (
                    <section className="dashboard-section">
                        <div className="dashboard-card">
                            <div className="card-header">
                                <div>
                                    <span className="section-label">
                                        INICIO
                                    </span>
                                    <h2>Bienvenido al panel</h2>
                                    <p>
                                        Desde acá podés administrar tus grupos,
                                        clases, alumnos y asistencias.
                                    </p>
                                </div>
                            </div>

                            <div className="stats-grid">
                                <div className="stat-card">
                                    <span>Grupos</span>
                                    <strong>{grupos.length}</strong>
                                </div>

                                <div className="stat-card">
                                    <span>Clases</span>
                                    <strong>{clases.length}</strong>
                                </div>

                                <div className="stat-card">
                                    <span>Alumnos</span>
                                    <strong>
                                        {loadingAlumnosGrupos
                                            ? "..."
                                            : totalAlumnos}
                                    </strong>
                                </div>

                                <div className="stat-card">
                                    <span>Profesor</span>
                                    <strong>#{idProfesor ?? "-"}</strong>
                                </div>
                            </div>

                            <div
                                className="dashboard-card"
                                style={{ marginTop: "25px" }}
                            >
                                <div className="card-header">
                                    <div>
                                        <span className="section-label">
                                            RESUMEN
                                        </span>
                                        <h2>Actividad</h2>
                                    </div>
                                </div>

                                <div className="stats-grid">
                                    <div className="stat-card">
                                        <span>Presentes</span>
                                        <strong>{totalPresentes}</strong>
                                    </div>

                                    <div className="stat-card">
                                        <span>Ausentes</span>
                                        <strong>{totalAusentes}</strong>
                                    </div>

                                    <div className="stat-card">
                                        <span>Registradas</span>
                                        <strong>{totalRegistradas}</strong>
                                    </div>

                                    <div className="stat-card">
                                        <span>Asistencia</span>
                                        <strong>{porcentajeAsistencia}%</strong>
                                    </div>
                                </div>
                            </div>

                            <div
                                className="dashboard-card"
                                style={{ marginTop: "25px" }}
                            >
                                <div className="card-header">
                                    <div>
                                        <span className="section-label">
                                            ACCIONES
                                        </span>
                                        <h2>Accesos rápidos</h2>
                                    </div>
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: "12px",
                                    }}
                                >
                                    <button
                                        className="primary-button"
                                        onClick={() =>
                                            cambiarSeccion("grupos")
                                        }
                                    >
                                        👥 Ver grupos
                                    </button>

                                    <button
                                        className="primary-button"
                                        onClick={() =>
                                            cambiarSeccion("clases")
                                        }
                                    >
                                        📚 Ver clases
                                    </button>

                                    <button
                                        className="primary-button"
                                        onClick={() =>
                                            cambiarSeccion("alumnos")
                                        }
                                    >
                                        🎓 Ver alumnos
                                    </button>

                                    <button
                                        className="primary-button"
                                        onClick={() =>
                                            cambiarSeccion("asistencias")
                                        }
                                    >
                                        ✅ Asistencias
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* GRUPOS */}
                {seccion === "grupos" && (
                    <section className="dashboard-section">
                        <div className="dashboard-card">
                            <div className="card-header">
                                <div>
                                    <span className="section-label">
                                        GRUPOS
                                    </span>
                                    <h2>Mis grupos</h2>
                                    <p>
                                        Grupos que tenés asignados.
                                    </p>
                                </div>

                                <button
                                    className="primary-button"
                                    onClick={() =>
                                        setMostrarFormularioGrupo(
                                            !mostrarFormularioGrupo,
                                        )
                                    }
                                >
                                    {mostrarFormularioGrupo
                                        ? "Cancelar"
                                        : "+ Crear grupo"}
                                </button>
                            </div>

                            {mostrarFormularioGrupo && (
                                <div
                                    className="dashboard-card"
                                    style={{ marginTop: "20px" }}
                                >
                                    <div className="card-header">
                                        <div>
                                            <span className="section-label">
                                                NUEVO GRUPO
                                            </span>
                                            <h2>Crear grupo</h2>
                                            <p>
                                                Completá los datos del nuevo
                                                grupo.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="profile-info">
                                        <div className="profile-row">
                                            <span>Disciplina</span>

                                            <select
                                                value={nuevoGrupo.id_disciplina}
                                                onChange={(e) =>
                                                    cambiarDatoGrupo(
                                                        "id_disciplina",
                                                        Number(e.target.value),
                                                    )
                                                }
                                                disabled={loadingDisciplinas}
                                            >
                                                {loadingDisciplinas ? (
                                                    <option value="">
                                                        Cargando...
                                                    </option>
                                                ) : disciplinas.length === 0 ? (
                                                    <option value="">
                                                        No hay disciplinas
                                                    </option>
                                                ) : (
                                                    disciplinas.map(
                                                        (disciplina) => (
                                                            <option
                                                                key={
                                                                    disciplina.id_disciplina
                                                                }
                                                                value={
                                                                    disciplina.id_disciplina
                                                                }
                                                            >
                                                                {
                                                                    disciplina.disciplina
                                                                }
                                                            </option>
                                                        ),
                                                    )
                                                )}
                                            </select>
                                        </div>

                                        <div className="profile-row">
                                            <span>Nivel</span>

                                            <select
                                                value={nuevoGrupo.nivel}
                                                onChange={(e) =>
                                                    cambiarDatoGrupo(
                                                        "nivel",
                                                        e.target.value,
                                                    )
                                                }
                                            >
                                                <option value="Principiante">
                                                    Principiante
                                                </option>
                                                <option value="Intermedio">
                                                    Intermedio
                                                </option>
                                                <option value="Avanzado">
                                                    Avanzado
                                                </option>
                                            </select>
                                        </div>

                                        <div className="profile-row">
                                            <span>Cupo máximo</span>

                                            <input
                                                type="number"
                                                min="1"
                                                step="1"
                                                value={nuevoGrupo.cupo_max}
                                                onChange={(e) =>
                                                    cambiarDatoGrupo(
                                                        "cupo_max",
                                                        Number(e.target.value),
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="profile-row">
                                            <span>Día</span>

                                            <select
                                                value={nuevoGrupo.dia_semana}
                                                onChange={(e) =>
                                                    cambiarDatoGrupo(
                                                        "dia_semana",
                                                        e.target.value,
                                                    )
                                                }
                                            >
                                                <option value="lunes">Lunes</option>
                                                <option value="martes">Martes</option>
                                                <option value="miércoles">Miércoles</option>
                                                <option value="jueves">Jueves</option>
                                                <option value="viernes">Viernes</option>
                                                <option value="sábado">Sábado</option>
                                                <option value="domingo">Domingo</option>
                                            </select>
                                        </div>

                                        <div className="profile-row">
                                            <span>Hora inicio</span>

                                            <input
                                                type="time"
                                                value={nuevoGrupo.hora_inicio}
                                                onChange={(e) =>
                                                    cambiarDatoGrupo(
                                                        "hora_inicio",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="profile-row">
                                            <span>Hora fin</span>

                                            <input
                                                type="time"
                                                value={nuevoGrupo.hora_fin}
                                                onChange={(e) =>
                                                    cambiarDatoGrupo(
                                                        "hora_fin",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                        </div>

                                        <div
                                            style={{
                                                marginTop: "20px",
                                                display: "flex",
                                                gap: "10px",
                                            }}
                                        >
                                            <button
                                                className="primary-button"
                                                onClick={ejecutarCrearGrupo}
                                                disabled={
                                                    creandoGrupo ||
                                                    loadingDisciplinas ||
                                                    disciplinas.length === 0
                                                }
                                            >
                                                {creandoGrupo
                                                    ? "Creando..."
                                                    : "Crear grupo"}
                                            </button>

                                            <button
                                                className="outline-button"
                                                onClick={() =>
                                                    setMostrarFormularioGrupo(
                                                        false,
                                                    )
                                                }
                                                disabled={creandoGrupo}
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {loadingGrupos ? (
                                <div className="loading">
                                    Cargando grupos...
                                </div>
                            ) : errorGrupos ? (
                                <div
                                    className="dashboard-warning"
                                    style={{ whiteSpace: "pre-line" }}
                                >
                                    ⚠️ {errorGrupos}
                                </div>
                            ) : grupos.length === 0 ? (
                                <div className="empty-state">
                                    <div>👥</div>
                                    <strong>No tenés grupos</strong>
                                    <span>
                                        Todavía no hay grupos asignados.
                                    </span>
                                </div>
                            ) : (
                                <div className="groups-grid">
                                    {grupos.map((grupo) => {
                                        const alumnosGrupo =
                                            alumnosPorGrupo[grupo.id_grupo] ??
                                            [];

                                        const horarios =
                                            horariosGrupo[grupo.id_grupo] ??
                                            grupo.horarios ??
                                            [];

                                        return (
                                            <div
                                                className="group-card"
                                                key={grupo.id_grupo}
                                            >
                                                <div className="group-card-header">
                                                    <span>
                                                        {grupo.disciplina}
                                                    </span>
                                                    <span>{grupo.nivel}</span>
                                                </div>

                                                <h3>{grupo.disciplina}</h3>
                                                <p>Nivel: {grupo.nivel}</p>

                                                <p>
                                                    👥 Alumnos:{" "}
                                                    {loadingAlumnosGrupos
                                                        ? "..."
                                                        : alumnosGrupo.length}{" "}
                                                    / {grupo.cupo_max}
                                                </p>

                                                {loadingHorarios ? (
                                                    <div className="loading">
                                                        Cargando horarios...
                                                    </div>
                                                ) : horarios.length > 0 ? (
                                                    <div className="group-schedule">
                                                        {horarios.map(
                                                            (
                                                                horario: any,
                                                                indice: number,
                                                            ) => (
                                                                <div
                                                                    key={
                                                                        horario.id_horario ??
                                                                        indice
                                                                    }
                                                                >
                                                                    📅{" "}
                                                                    {
                                                                        horario.dia_semana
                                                                    }
                                                                    <br />
                                                                    🕐{" "}
                                                                    {
                                                                        horario.hora_inicio
                                                                    }{" "}
                                                                    -{" "}
                                                                    {
                                                                        horario.hora_fin
                                                                    }
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                ) : null}

                                                <button
                                                    className="primary-button"
                                                    style={{
                                                        marginTop: "15px",
                                                    }}
                                                    onClick={() =>
                                                        cambiarSeccion("clases")
                                                    }
                                                >
                                                    📚 Ver clases
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* CLASES */}
                {seccion === "clases" && (
                    <section className="dashboard-section">
                        <div className="dashboard-card">
                            <div className="card-header">
                                <div>
                                    <span className="section-label">
                                        CLASES
                                    </span>
                                    <h2>Mis clases</h2>
                                    <p>
                                        Seleccioná una clase para consultar
                                        sus alumnos y registrar asistencia.
                                    </p>
                                </div>
                            </div>

                            {loadingClases ? (
                                <div className="loading">
                                    Cargando clases...
                                </div>
                            ) : errorClases ? (
                                <div
                                    className="dashboard-warning"
                                    style={{ whiteSpace: "pre-line" }}
                                >
                                    ⚠️ {errorClases}
                                </div>
                            ) : clases.length === 0 ? (
                                <div className="empty-state">
                                    <div>📚</div>
                                    <strong>No tenés clases</strong>
                                    <span>
                                        No hay clases asignadas actualmente.
                                    </span>
                                </div>
                            ) : (
                                <div className="classes-grid">
                                    {clases.map((clase) => (
                                        <div
                                            className={
                                                Number(claseSeleccionada) ===
                                                Number(clase.id_clase)
                                                    ? "class-card selected"
                                                    : "class-card"
                                            }
                                            key={clase.id_clase}
                                            onClick={() =>
                                                void cargarAlumnosClase(
                                                    Number(clase.id_clase),
                                                )
                                            }
                                        >
                                            <div className="class-card-header">
                                                <span>Clase</span>
                                                <span>
                                                    #{clase.id_clase}
                                                </span>
                                            </div>

                                            <h3>
                                                {clase.disciplina ?? "Clase"}
                                            </h3>

                                            {clase.nivel && (
                                                <p>
                                                    Nivel: {clase.nivel}
                                                </p>
                                            )}

                                            <p>Grupo: {clase.id_grupo}</p>

                                            {clase.fecha && (
                                                <p>📅 {clase.fecha}</p>
                                            )}

                                            {clase.hora_inicio && (
                                                <p>
                                                    🕐 {clase.hora_inicio} -{" "}
                                                    {clase.hora_fin}
                                                </p>
                                            )}

                                            {clase.estado && (
                                                <p>
                                                    Estado: {clase.estado}
                                                </p>
                                            )}

                                            <button
                                                className="primary-button"
                                                onClick={(event) => {
                                                    event.stopPropagation();

                                                    void cargarAlumnosClase(
                                                        Number(clase.id_clase),
                                                    );
                                                }}
                                            >
                                                Ver alumnos
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {claseSeleccionada !== null && (
                            <div className="dashboard-card class-students">
                                <div className="card-header">
                                    <div>
                                        <span className="section-label">
                                            ASISTENCIA
                                        </span>
                                        <h2>Alumnos de la clase</h2>

                                        {claseActual && (
                                            <p>
                                                {claseActual.disciplina ??
                                                    "Clase"}{" "}
                                                · {claseActual.fecha}
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        className="outline-button"
                                        onClick={() => {
                                            setClaseSeleccionada(null);
                                            setAlumnos([]);
                                            setAsistencias({});
                                            setErrorAlumnos("");
                                        }}
                                    >
                                        Cerrar
                                    </button>
                                </div>

                                {loadingAlumnos || loadingAsistencias ? (
                                    <div className="loading">
                                        Cargando alumnos y asistencias...
                                    </div>
                                ) : errorAlumnos && alumnos.length === 0 ? (
                                    <div
                                        className="dashboard-warning"
                                        style={{ whiteSpace: "pre-line" }}
                                    >
                                        ⚠️ {errorAlumnos}
                                    </div>
                                ) : alumnos.length === 0 ? (
                                    <div className="empty-state">
                                        <div>🎓</div>
                                        <strong>
                                            No hay alumnos registrados
                                        </strong>
                                        <span>
                                            Esta clase todavía no tiene alumnos.
                                        </span>
                                    </div>
                                ) : (
                                    <>
                                        {errorAlumnos && (
                                            <div
                                                className="dashboard-warning"
                                                style={{
                                                    whiteSpace: "pre-line",
                                                    marginBottom: "15px",
                                                }}
                                            >
                                                ⚠️ {errorAlumnos}
                                            </div>
                                        )}

                                        <div className="attendance-list">
                                            {alumnos.map((alumno) => {
                                                const idAlumno = Number(
                                                    alumno.id_alumno,
                                                );

                                                const asistencia =
                                                    asistencias[idAlumno];

                                                const estado =
                                                    asistencia?.estado;

                                                const guardando =
                                                    guardandoAsistencia ===
                                                    idAlumno;

                                                return (
                                                    <div
                                                        className="attendance-item"
                                                        key={idAlumno}
                                                    >
                                                        <div className="student-avatar">
                                                            {alumno.nombre
                                                                ?.charAt(0)
                                                                ?.toUpperCase()}
                                                        </div>

                                                        <div className="attendance-student">
                                                            <strong>
                                                                {alumno.nombre}{" "}
                                                                {alumno.apellido}
                                                            </strong>

                                                            <span>
                                                                ID Alumno:{" "}
                                                                {idAlumno}
                                                            </span>

                                                            {alumno.dni && (
                                                                <span>
                                                                    DNI:{" "}
                                                                    {alumno.dni}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="attendance-status">
                                                            {asistencia ? (
                                                                <span
                                                                    className={
                                                                        estado ===
                                                                        "presente"
                                                                            ? "status present"
                                                                            : "status absent"
                                                                    }
                                                                >
                                                                    {estado ===
                                                                    "presente"
                                                                        ? "✓ Presente"
                                                                        : "✕ Ausente"}
                                                                </span>
                                                            ) : (
                                                                <span className="status pending">
                                                                    Sin registrar
                                                                </span>
                                                            )}
                                                        </div>

                                                        {!asistencia && (
                                                            <div className="attendance-actions">
                                                                <button
                                                                    className="attendance-present"
                                                                    disabled={
                                                                        guardandoAsistencia !==
                                                                        null
                                                                    }
                                                                    onClick={() =>
                                                                        void guardarAsistencia(
                                                                            idAlumno,
                                                                            Number(
                                                                                claseSeleccionada,
                                                                            ),
                                                                            "presente",
                                                                        )
                                                                    }
                                                                >
                                                                    {guardando
                                                                        ? "Guardando..."
                                                                        : "✓ Presente"}
                                                                </button>

                                                                <button
                                                                    className="attendance-absent"
                                                                    disabled={
                                                                        guardandoAsistencia !==
                                                                        null
                                                                    }
                                                                    onClick={() =>
                                                                        void guardarAsistencia(
                                                                            idAlumno,
                                                                            Number(
                                                                                claseSeleccionada,
                                                                            ),
                                                                            "ausente",
                                                                        )
                                                                    }
                                                                >
                                                                    {guardando
                                                                        ? "Guardando..."
                                                                        : "✕ Ausente"}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </section>
                )}

                {/* ALUMNOS */}
                {seccion === "alumnos" && (
                    <section className="dashboard-section">
                        <div className="dashboard-card">
                            <div className="card-header">
                                <div>
                                    <span className="section-label">
                                        ALUMNOS
                                    </span>
                                    <h2>Mis alumnos</h2>
                                    <p>
                                        Alumnos asociados a tus grupos y clases.
                                    </p>
                                </div>
                            </div>

                            {loadingAlumnosGrupos ? (
                                <div className="loading">
                                    Cargando alumnos...
                                </div>
                            ) : totalAlumnos === 0 ? (
                                <div className="empty-state">
                                    <div>🎓</div>
                                    <strong>No hay alumnos</strong>
                                    <span>
                                        Todavía no hay alumnos asociados a tus
                                        clases.
                                    </span>
                                </div>
                            ) : (
                                <div className="attendance-list">
                                    {Array.from(
                                        new Map(
                                            Object.values(alumnosPorGrupo)
                                                .flat()
                                                .map((alumno) => [
                                                    Number(alumno.id_alumno),
                                                    alumno,
                                                ]),
                                        ).values(),
                                    ).map((alumno) => (
                                        <div
                                            className="attendance-item"
                                            key={alumno.id_alumno}
                                        >
                                            <div className="student-avatar">
                                                {alumno.nombre
                                                    ?.charAt(0)
                                                    ?.toUpperCase()}
                                            </div>

                                            <div className="attendance-student">
                                                <strong>
                                                    {alumno.nombre}{" "}
                                                    {alumno.apellido}
                                                </strong>

                                                <span>
                                                    ID Alumno:{" "}
                                                    {alumno.id_alumno}
                                                </span>

                                                {alumno.dni && (
                                                    <span>
                                                        DNI: {alumno.dni}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* ASISTENCIAS */}
                {seccion === "asistencias" && (
                    <section className="dashboard-section">
                        <div className="dashboard-card">
                            <div className="card-header">
                                <div>
                                    <span className="section-label">
                                        ASISTENCIAS
                                    </span>
                                    <h2>Registro de asistencias</h2>
                                    <p>
                                        Seleccioná una clase para consultar y
                                        registrar la asistencia.
                                    </p>
                                </div>
                            </div>

                            <div className="stats-grid">
                                <div className="stat-card">
                                    <span>Presentes</span>
                                    <strong>{totalPresentes}</strong>
                                </div>

                                <div className="stat-card">
                                    <span>Ausentes</span>
                                    <strong>{totalAusentes}</strong>
                                </div>

                                <div className="stat-card">
                                    <span>Registradas</span>
                                    <strong>{totalRegistradas}</strong>
                                </div>

                                <div className="stat-card">
                                    <span>Porcentaje</span>
                                    <strong>{porcentajeAsistencia}%</strong>
                                </div>
                            </div>

                            {loadingClases ? (
                                <div className="loading">
                                    Cargando clases...
                                </div>
                            ) : errorClases ? (
                                <div
                                    className="dashboard-warning"
                                    style={{ whiteSpace: "pre-line" }}
                                >
                                    ⚠️ {errorClases}
                                </div>
                            ) : clases.length === 0 ? (
                                <div className="empty-state">
                                    <div>📚</div>
                                    <strong>No tenés clases</strong>
                                    <span>
                                        No hay clases asignadas actualmente.
                                    </span>
                                </div>
                            ) : (
                                <div className="classes-grid">
                                    {clases.map((clase) => (
                                        <div
                                            className="class-card"
                                            key={clase.id_clase}
                                        >
                                            <h3>
                                                {clase.disciplina ?? "Clase"}
                                            </h3>

                                            <p>📅 {clase.fecha}</p>

                                            <p>
                                                🕐 {clase.hora_inicio} -{" "}
                                                {clase.hora_fin}
                                            </p>

                                            <button
                                                className="primary-button"
                                                onClick={() => {
                                                    setSeccion("clases");

                                                    void cargarAlumnosClase(
                                                        Number(clase.id_clase),
                                                    );
                                                }}
                                            >
                                                Registrar asistencia
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* LIQUIDACIONES */}
                {seccion === "liquidaciones" && (
                    <section className="dashboard-section">
                        <div className="dashboard-card">
                            <div className="card-header">
                                <div>
                                    <span className="section-label">
                                        LIQUIDACIONES
                                    </span>
                                    <h2>Mis liquidaciones</h2>
                                    <p>
                                        Acá vas a poder consultar tus
                                        liquidaciones.
                                    </p>
                                </div>
                            </div>

                            <div className="empty-state">
                                <div>💰</div>
                                <strong>Liquidaciones</strong>
                                <span>
                                    Esta sección estará disponible
                                    próximamente.
                                </span>
                            </div>
                        </div>
                    </section>
                )}

                {/* PERFIL */}
                {seccion === "perfil" && (
                    <section className="dashboard-section">
                        <div className="dashboard-card">
                            <div className="card-header">
                                <div>
                                    <span className="section-label">
                                        PERFIL
                                    </span>
                                    <h2>Mi perfil</h2>
                                </div>
                            </div>

                            {errorProfesor ? (
                                <div
                                    className="dashboard-warning"
                                    style={{ whiteSpace: "pre-line" }}
                                >
                                    ⚠️ {errorProfesor}
                                </div>
                            ) : (
                                <div className="profile-info">
                                    <div className="profile-row">
                                        <span>Nombre</span>
                                        <strong>
                                            {profesor?.nombre ??
                                                usuario?.nombre ??
                                                "-"}
                                        </strong>
                                    </div>

                                    <div className="profile-row">
                                        <span>Apellido</span>
                                        <strong>
                                            {profesor?.apellido ??
                                                usuario?.apellido ??
                                                "-"}
                                        </strong>
                                    </div>

                                    <div className="profile-row">
                                        <span>ID Profesor</span>
                                        <strong>
                                            {idProfesor ?? "-"}
                                        </strong>
                                    </div>

                                    <div className="profile-row">
                                        <span>Usuario</span>
                                        <strong>
                                            {usuario?.username ??
                                                usuario?.email ??
                                                "-"}
                                        </strong>
                                    </div>

                                    <div className="profile-row">
                                        <span>Estado</span>
                                        <strong>Activo</strong>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export default ProfesorDashboard;
