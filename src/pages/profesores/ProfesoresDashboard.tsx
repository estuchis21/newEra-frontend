
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import { obtenerProfesorPorUsuario } from "../../services/profesores.service";
import {
    crearGrupo,
    obtenerAlumnosPorClase,
    obtenerClasesProfesor,
    obtenerGruposProfesor,
    type AlumnoClase,
    type Clase,
    type Grupo,
} from "../../services/grupos.service";
import {
    obtenerAsistenciaAlumnoClase,
    registrarAsistencia,
    type Asistencia,
} from "../../services/asistencia.service";
import { obtenerDisciplinas } from "../../services/disciplinas.service";
import { obtenerHorariosGrupo } from "../../services/horarios.service";
import {
    obtenerLiquidacionesProfesor,
    type LiquidacionProfesor,
} from "../../services/liquidaciones.service";
import { exportarCSV, fechaLocal } from "../../utils/exportarCsv";

import "./ProfesoresDashboard.css";

type Seccion =
    | "inicio"
    | "grupos"
    | "clases"
    | "alumnos"
    | "asistencias"
    | "liquidaciones"
    | "reportes"
    | "perfil";

type Disciplina = {
    id_disciplina: number;
    disciplina: string;
};

type HorarioGrupo = {
    id_horario?: number;
    dia_semana: string;
    hora_inicio: string;
    hora_fin: string;
};

type NuevoGrupo = {
    id_disciplina: number;
    nivel: string;
    cupo_max: number;
    dia_semana: string;
    hora_inicio: string;
    hora_fin: string;
};

const FORMULARIO_GRUPO_INICIAL: NuevoGrupo = {
    id_disciplina: 0,
    nivel: "Principiante",
    cupo_max: 20,
    dia_semana: "Lunes",
    hora_inicio: "18:00",
    hora_fin: "19:00",
};

const ProfesorDashboard = () => {
    const navigate = useNavigate();

    // USUARIO Y PROFESOR
    const [usuario, setUsuario] = useState<any>(null);
    const [profesor, setProfesor] = useState<any>(null);
    const [idProfesor, setIdProfesor] = useState<number | null>(null);
    const [loadingProfesor, setLoadingProfesor] = useState(true);
    const [errorProfesor, setErrorProfesor] = useState("");

    // NAVEGACIÓN Y REPORTES
    const [seccion, setSeccion] = useState<Seccion>("inicio");
    const [busquedaAlumnoReporte, setBusquedaAlumnoReporte] = useState("");

    // LIQUIDACIONES
    const [liquidaciones, setLiquidaciones] = useState<
        LiquidacionProfesor[]
    >([]);
    const [loadingLiquidaciones, setLoadingLiquidaciones] = useState(false);
    const [errorLiquidaciones, setErrorLiquidaciones] = useState("");

    // GRUPOS
    const [grupos, setGrupos] = useState<Grupo[]>([]);
    const [loadingGrupos, setLoadingGrupos] = useState(false);
    const [errorGrupos, setErrorGrupos] = useState("");

    // CREAR GRUPO
    const [mostrarFormularioGrupo, setMostrarFormularioGrupo] = useState(false);
    const [creandoGrupo, setCreandoGrupo] = useState(false);
    const [nuevoGrupo, setNuevoGrupo] = useState<NuevoGrupo>(
        FORMULARIO_GRUPO_INICIAL,
    );

    // DISCIPLINAS
    const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
    const [loadingDisciplinas, setLoadingDisciplinas] = useState(false);

    // CLASES
    const [clases, setClases] = useState<Clase[]>([]);
    const [loadingClases, setLoadingClases] = useState(false);
    const [errorClases, setErrorClases] = useState("");
    const [claseSeleccionada, setClaseSeleccionada] = useState<number | null>(
        null,
    );

    // ALUMNOS Y ASISTENCIAS DE LA CLASE SELECCIONADA
    const [alumnos, setAlumnos] = useState<AlumnoClase[]>([]);
    const [loadingAlumnos, setLoadingAlumnos] = useState(false);
    const [errorAlumnos, setErrorAlumnos] = useState("");
    const [asistencias, setAsistencias] = useState<
        Record<number, Asistencia | null>
    >({});
    const [loadingAsistencias, setLoadingAsistencias] = useState(false);
    const [guardandoAsistencia, setGuardandoAsistencia] = useState<
        number | null
    >(null);

    // HORARIOS Y ALUMNOS POR GRUPO
    const [horariosGrupo, setHorariosGrupo] = useState<
        Record<number, HorarioGrupo[]>
    >({});
    const [loadingHorarios, setLoadingHorarios] = useState(false);
    const [errorHorarios, setErrorHorarios] = useState("");

    const [alumnosPorGrupo, setAlumnosPorGrupo] = useState<
        Record<number, AlumnoClase[]>
    >({});
    const [loadingAlumnosGrupos, setLoadingAlumnosGrupos] = useState(false);
    const [errorAlumnosGrupos, setErrorAlumnosGrupos] = useState("");

    // ALERTAS
    const mostrarExito = async (titulo: string, texto: string) => {
        await Swal.fire({
            icon: "success",
            title: titulo,
            text: texto,
            confirmButtonText: "Aceptar",
        });
    };

    const mostrarError = async (titulo: string, texto: string) => {
        await Swal.fire({
            icon: "error",
            title: titulo,
            text: texto,
            confirmButtonText: "Aceptar",
        });
    };

    // SESIÓN
    const obtenerIdUsuario = useCallback((): number | null => {
        const usuarioGuardado = localStorage.getItem("usuario");

        if (!usuarioGuardado) return null;

        try {
            const usuarioParseado = JSON.parse(usuarioGuardado);
            setUsuario(usuarioParseado);

            const id =
                usuarioParseado.id_usuario ??
                usuarioParseado.idUsuario ??
                usuarioParseado.id;

            const idNumero = Number(id);

            if (!Number.isInteger(idNumero) || idNumero <= 0) {
                return null;
            }

            return idNumero;
        } catch (error) {
            console.error("Error leyendo usuario:", error);
            return null;
        }
    }, []);

    const cerrarSesion = () => {
        localStorage.removeItem("usuario");
        localStorage.removeItem("token");
        navigate("/login");
    };

    // CARGAR PROFESOR
    const cargarProfesor = useCallback(async () => {
        try {
            setLoadingProfesor(true);
            setErrorProfesor("");

            const idUsuario = obtenerIdUsuario();

            if (!idUsuario) {
                setErrorProfesor("No se pudo obtener el usuario.");
                return;
            }

            const datos = await obtenerProfesorPorUsuario(idUsuario);
            setProfesor(datos);

            const id = Number(datos?.id_profesor);

            if (Number.isInteger(id) && id > 0) {
                setIdProfesor(id);
            } else {
                setErrorProfesor("No se pudo obtener el ID del profesor.");
            }
        } catch (error) {
            console.error("Error obteniendo profesor:", error);
            setErrorProfesor(
                "No se pudo cargar la información del profesor.",
            );
        } finally {
            setLoadingProfesor(false);
        }
    }, [obtenerIdUsuario]);

    // CARGAR DISCIPLINAS
    const cargarDisciplinas = useCallback(async () => {
        try {
            setLoadingDisciplinas(true);

            const datos = await obtenerDisciplinas();
            const lista = Array.isArray(datos)
                ? (datos as Disciplina[])
                : [];

            setDisciplinas(lista);

            setNuevoGrupo((anterior) => {
                const seleccionActualValida = lista.some(
                    (disciplina) =>
                        Number(disciplina.id_disciplina) ===
                        Number(anterior.id_disciplina),
                );

                return {
                    ...anterior,
                    id_disciplina: seleccionActualValida
                        ? anterior.id_disciplina
                        : Number(lista[0]?.id_disciplina ?? 0),
                };
            });
        } catch (error) {
            console.error("Error obteniendo disciplinas:", error);
            setDisciplinas([]);
            setNuevoGrupo((anterior) => ({
                ...anterior,
                id_disciplina: 0,
            }));
        } finally {
            setLoadingDisciplinas(false);
        }
    }, []);

    // CARGAR GRUPOS
    const cargarGrupos = useCallback(async () => {
        if (!idProfesor) return;

        try {
            setLoadingGrupos(true);
            setErrorGrupos("");

            const datos = await obtenerGruposProfesor(idProfesor);
            setGrupos(Array.isArray(datos) ? datos : []);
        } catch (error) {
            console.error("Error obteniendo grupos:", error);
            setErrorGrupos("No se pudieron cargar tus grupos.");
            setGrupos([]);
        } finally {
            setLoadingGrupos(false);
        }
    }, [idProfesor]);

    // CARGAR CLASES
    const cargarClases = useCallback(async () => {
        if (!idProfesor) return;

        try {
            setLoadingClases(true);
            setErrorClases("");

            const datos = await obtenerClasesProfesor(idProfesor);
            setClases(Array.isArray(datos) ? datos : []);
        } catch (error) {
            console.error("Error obteniendo clases:", error);
            setErrorClases("No se pudieron cargar tus clases.");
            setClases([]);
        } finally {
            setLoadingClases(false);
        }
    }, [idProfesor]);

    // CARGAR HORARIOS: PETICIONES CONCURRENTES
    const cargarHorariosGrupos = useCallback(async () => {
        if (grupos.length === 0) {
            setHorariosGrupo({});
            setErrorHorarios("");
            return;
        }

        try {
            setLoadingHorarios(true);
            setErrorHorarios("");

            const resultados = await Promise.all(
                grupos.map(async (grupo) => {
                    try {
                        const datos = await obtenerHorariosGrupo(
                            grupo.id_grupo,
                        );

                        return {
                            idGrupo: grupo.id_grupo,
                            horarios: Array.isArray(datos)
                                ? (datos as HorarioGrupo[])
                                : [],
                        };
                    } catch (error) {
                        console.error(
                            `Error obteniendo horarios del grupo ${grupo.id_grupo}:`,
                            error,
                        );

                        return {
                            idGrupo: grupo.id_grupo,
                            horarios: [],
                            error: true,
                        };
                    }
                }),
            );

            const mapa: Record<number, HorarioGrupo[]> = {};

            resultados.forEach((resultado) => {
                mapa[resultado.idGrupo] = resultado.horarios;
            });

            setHorariosGrupo(mapa);

            if (resultados.some((resultado) => "error" in resultado)) {
                setErrorHorarios(
                    "No se pudieron cargar todos los horarios.",
                );
            }
        } finally {
            setLoadingHorarios(false);
        }
    }, [grupos]);

    // CARGAR ALUMNOS DE TODOS LOS GRUPOS
    // Las clases de cada grupo se consultan en paralelo, no una por una.
    const cargarAlumnosGrupos = useCallback(async () => {
        if (grupos.length === 0 || clases.length === 0) {
            setAlumnosPorGrupo({});
            setErrorAlumnosGrupos("");
            return;
        }

        try {
            setLoadingAlumnosGrupos(true);
            setErrorAlumnosGrupos("");

            const resultados = await Promise.all(
                grupos.map(async (grupo) => {
                    const clasesGrupo = clases.filter(
                        (clase) =>
                            Number(clase.id_grupo) ===
                            Number(grupo.id_grupo),
                    );

                    const respuestas = await Promise.all(
                        clasesGrupo.map(async (clase) => {
                            try {
                                const datos = await obtenerAlumnosPorClase(
                                    clase.id_clase,
                                );

                                return {
                                    alumnos: Array.isArray(datos)
                                        ? datos
                                        : [],
                                    error: false,
                                };
                            } catch (error) {
                                console.error(
                                    `Error obteniendo alumnos de clase ${clase.id_clase}:`,
                                    error,
                                );

                                return {
                                    alumnos: [],
                                    error: true,
                                };
                            }
                        }),
                    );

                    const mapaAlumnos = new Map<number, AlumnoClase>();

                    respuestas.forEach((respuesta) => {
                        respuesta.alumnos.forEach((alumno: AlumnoClase) => {
                            mapaAlumnos.set(
                                Number(alumno.id_alumno),
                                alumno,
                            );
                        });
                    });

                    return {
                        idGrupo: grupo.id_grupo,
                        alumnos: Array.from(mapaAlumnos.values()),
                        error: respuestas.some((respuesta) => respuesta.error),
                    };
                }),
            );

            const mapa: Record<number, AlumnoClase[]> = {};

            resultados.forEach((resultado) => {
                mapa[resultado.idGrupo] = resultado.alumnos;
            });

            setAlumnosPorGrupo(mapa);

            if (resultados.some((resultado) => resultado.error)) {
                setErrorAlumnosGrupos(
                    "Algunos alumnos no pudieron cargarse. Podés volver a intentar actualizando la página.",
                );
            }
        } finally {
            setLoadingAlumnosGrupos(false);
        }
    }, [grupos, clases]);

    // CARGAR ALUMNOS Y ASISTENCIAS DE UNA CLASE
    const cargarAlumnosClase = async (idClase: number) => {
        if (!Number.isInteger(Number(idClase)) || Number(idClase) <= 0) {
            await mostrarError("Error", "El ID de la clase no es válido.");
            return;
        }

        try {
            setClaseSeleccionada(idClase);
            setLoadingAlumnos(true);
            setLoadingAsistencias(true);
            setErrorAlumnos("");
            setAlumnos([]);
            setAsistencias({});

            const datos = await obtenerAlumnosPorClase(idClase);
            const alumnosClase: AlumnoClase[] = Array.isArray(datos)
                ? datos
                : [];

            setAlumnos(alumnosClase);

            // Consultar las asistencias de todos los alumnos en paralelo.
            const resultados = await Promise.all(
                alumnosClase.map(async (alumno) => {
                    const idAlumno = Number(alumno.id_alumno);

                    if (!Number.isInteger(idAlumno) || idAlumno <= 0) {
                        return {
                            idAlumno: 0,
                            asistencia: null as Asistencia | null,
                        };
                    }

                    try {
                        const datosAsistencia =
                            await obtenerAsistenciaAlumnoClase(
                                idAlumno,
                                idClase,
                            );

                        return {
                            idAlumno,
                            asistencia:
                                Array.isArray(datosAsistencia) &&
                                datosAsistencia.length > 0
                                    ? datosAsistencia[0]
                                    : null,
                        };
                    } catch (error) {
                        console.error(
                            `Error obteniendo asistencia del alumno ${idAlumno}:`,
                            error,
                        );

                        return {
                            idAlumno,
                            asistencia: null as Asistencia | null,
                        };
                    }
                }),
            );

            const mapa: Record<number, Asistencia | null> = {};

            resultados.forEach((resultado) => {
                if (resultado.idAlumno > 0) {
                    mapa[resultado.idAlumno] = resultado.asistencia;
                }
            });

            setAsistencias(mapa);
        } catch (error) {
            console.error("Error obteniendo alumnos:", error);
            setErrorAlumnos(
                "No se pudieron cargar los alumnos de esta clase.",
            );

            await mostrarError(
                "Error",
                "No se pudieron cargar los alumnos de esta clase.",
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
    ) => {
        if (!Number.isInteger(idAlumno) || idAlumno <= 0) {
            await mostrarError("Error", "El ID del alumno no es válido.");
            return;
        }

        if (!Number.isInteger(idClase) || idClase <= 0) {
            await mostrarError("Error", "El ID de la clase no es válido.");
            return;
        }

        if (asistencias[idAlumno]) return;

        try {
            setGuardandoAsistencia(idAlumno);

            await registrarAsistencia({
                id_alumno: idAlumno,
                id_clase: idClase,
                estado,
                observaciones: "",
            });

            setAsistencias((anteriores) => ({
                ...anteriores,
                [idAlumno]: {
                    id_asistencia: 0,
                    id_alumno: idAlumno,
                    id_clase: idClase,
                    estado,
                    observaciones: "",
                },
            }));

            await mostrarExito(
                "Asistencia registrada",
                `El alumno fue marcado como ${
                    estado === "presente" ? "presente" : "ausente"
                }.`,
            );
        } catch (error: any) {
            console.error("Error registrando asistencia:", error);

            const mensaje =
                error?.response?.data?.message ??
                "No se pudo registrar la asistencia.";

            await mostrarError(
                "Error",
                Array.isArray(mensaje) ? mensaje.join(", ") : mensaje,
            );
        } finally {
            setGuardandoAsistencia(null);
        }
    };

    // FORMULARIO DE GRUPOS
    const cambiarDatoGrupo = (
        campo: keyof NuevoGrupo,
        valor: string | number,
    ) => {
        setNuevoGrupo((anterior) => ({
            ...anterior,
            [campo]: valor,
        }));
    };

    const ejecutarCrearGrupo = async () => {
        if (!idProfesor) {
            await mostrarError(
                "Error",
                "No se pudo obtener el ID del profesor.",
            );
            return;
        }

        if (
            !Number.isInteger(Number(nuevoGrupo.id_disciplina)) ||
            nuevoGrupo.id_disciplina <= 0 ||
            !disciplinas.some(
                (disciplina) =>
                    Number(disciplina.id_disciplina) ===
                    Number(nuevoGrupo.id_disciplina),
            )
        ) {
            await mostrarError("Error", "Seleccioná una disciplina válida.");
            return;
        }

        if (!nuevoGrupo.nivel.trim()) {
            await mostrarError("Error", "Ingresá el nivel del grupo.");
            return;
        }

        if (
            !Number.isInteger(Number(nuevoGrupo.cupo_max)) ||
            nuevoGrupo.cupo_max <= 0
        ) {
            await mostrarError(
                "Error",
                "El cupo máximo debe ser un número mayor a 0.",
            );
            return;
        }

        if (!nuevoGrupo.dia_semana) {
            await mostrarError("Error", "Seleccioná un día.");
            return;
        }

        if (!nuevoGrupo.hora_inicio || !nuevoGrupo.hora_fin) {
            await mostrarError("Error", "Ingresá el horario completo.");
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
                id_profesor: Number(idProfesor),
                horarios: [
                    {
                        dia_semana: nuevoGrupo.dia_semana,
                        hora_inicio: nuevoGrupo.hora_inicio,
                        hora_fin: nuevoGrupo.hora_fin,
                    },
                ],
            };

            await crearGrupo(datosGrupo);

            setMostrarFormularioGrupo(false);

            setNuevoGrupo({
                ...FORMULARIO_GRUPO_INICIAL,
                id_disciplina: Number(
                    disciplinas[0]?.id_disciplina ?? 0,
                ),
            });

            // Actualizar grupos y clases en paralelo.
            await Promise.all([cargarGrupos(), cargarClases()]);

            await mostrarExito(
                "Grupo creado",
                "El grupo fue creado correctamente.",
            );
        } catch (error: any) {
            console.error("Error creando grupo:", error);

            const mensaje =
                error?.response?.data?.message ??
                "No se pudo crear el grupo.";

            await mostrarError(
                "Error",
                Array.isArray(mensaje) ? mensaje.join(", ") : mensaje,
            );
        } finally {
            setCreandoGrupo(false);
        }
    };

    // ESTADÍSTICAS DE LA CLASE CONSULTADA
    const totalAlumnos = useMemo(() => {
        const ids = new Set<number>();

        Object.values(alumnosPorGrupo)
            .flat()
            .forEach((alumno) => {
                const id = Number(alumno.id_alumno);
                if (Number.isInteger(id) && id > 0) ids.add(id);
            });

        return ids.size;
    }, [alumnosPorGrupo]);

    const totalPresentes = useMemo(
        () =>
            Object.values(asistencias).filter(
                (asistencia) => asistencia?.estado === "presente",
            ).length,
        [asistencias],
    );

    const totalAusentes = useMemo(
        () =>
            Object.values(asistencias).filter(
                (asistencia) => asistencia?.estado === "ausente",
            ).length,
        [asistencias],
    );

    const totalRegistradas = totalPresentes + totalAusentes;

    const porcentajeAsistencia =
        totalRegistradas > 0
            ? Math.round((totalPresentes / totalRegistradas) * 100)
            : 0;

    const claseActual = useMemo(
        () =>
            clases.find(
                (clase) =>
                    Number(clase.id_clase) === Number(claseSeleccionada),
            ),
        [clases, claseSeleccionada],
    );

    // LISTA ÚNICA DE ALUMNOS
    const alumnosUnicos = useMemo(() => {
        const mapa = new Map<number, AlumnoClase>();

        Object.values(alumnosPorGrupo)
            .flat()
            .forEach((alumno) => {
                const id = Number(alumno.id_alumno);

                if (Number.isInteger(id) && id > 0) {
                    mapa.set(id, alumno);
                }
            });

        return Array.from(mapa.values()).sort((a, b) => {
            const nombreA =
                `${a.apellido ?? ""} ${a.nombre ?? ""}`.toLocaleLowerCase(
                    "es-AR",
                );

            const nombreB =
                `${b.apellido ?? ""} ${b.nombre ?? ""}`.toLocaleLowerCase(
                    "es-AR",
                );

            return nombreA.localeCompare(nombreB, "es-AR");
        });
    }, [alumnosPorGrupo]);

    // FILTRO DE REPORTES: NOMBRE, APELLIDO, ID O DNI
    const alumnosFiltradosReporte = useMemo(() => {
        const termino = busquedaAlumnoReporte
            .trim()
            .toLocaleLowerCase("es-AR");

        if (!termino) return alumnosUnicos;

        return alumnosUnicos.filter((alumno) => {
            const nombreCompleto =
                `${alumno.nombre ?? ""} ${alumno.apellido ?? ""}`
                    .toLocaleLowerCase("es-AR");

            return (
                nombreCompleto.includes(termino) ||
                String(alumno.id_alumno).includes(termino) ||
                String(alumno.dni ?? "")
                    .toLocaleLowerCase("es-AR")
                    .includes(termino)
            );
        });
    }, [alumnosUnicos, busquedaAlumnoReporte]);

    const cambiarSeccion = (nuevaSeccion: Seccion) => {
        setSeccion(nuevaSeccion);

        if (nuevaSeccion !== "clases" && nuevaSeccion !== "asistencias") {
            setClaseSeleccionada(null);
            setAlumnos([]);
            setAsistencias({});
            setErrorAlumnos("");
        }
    };

    const exportarReporteAlumnos = async () => {
        if (alumnosFiltradosReporte.length === 0) {
            await mostrarError(
                "Sin resultados",
                "No hay alumnos que coincidan con la búsqueda.",
            );
            return;
        }

        const dataCsv = alumnosFiltradosReporte.map((alumno) => ({
            ID: alumno.id_alumno,
            Nombre: alumno.nombre ?? "",
            Apellido: alumno.apellido ?? "",
            DNI: alumno.dni ?? "",
        }));

        exportarCSV(
            dataCsv,
            `reporte_alumnos_${fechaLocal()}.csv`,
        );
    };

    // CARGA INICIAL
    useEffect(() => {
        void cargarProfesor();
        void cargarDisciplinas();
    }, [cargarProfesor, cargarDisciplinas]);

    // CARGAR GRUPOS Y CLASES AL CONOCER AL PROFESOR
    useEffect(() => {
        if (!idProfesor) return;

        void cargarGrupos();
        void cargarClases();
    }, [idProfesor, cargarGrupos, cargarClases]);

    // CARGAR LIQUIDACIONES
    useEffect(() => {
        if (!idProfesor) return;

        let cancelado = false;

        const cargarLiquidaciones = async () => {
            try {
                setLoadingLiquidaciones(true);
                setErrorLiquidaciones("");

                const datos =
                    await obtenerLiquidacionesProfesor(idProfesor);

                if (!cancelado) {
                    setLiquidaciones(Array.isArray(datos) ? datos : []);
                }
            } catch (error) {
                console.error("Error cargando liquidaciones:", error);

                if (!cancelado) {
                    setErrorLiquidaciones(
                        "No se pudieron cargar las liquidaciones. Verificá la conexión con el servidor.",
                    );
                    setLiquidaciones([]);
                }
            } finally {
                if (!cancelado) setLoadingLiquidaciones(false);
            }
        };

        void cargarLiquidaciones();

        return () => {
            cancelado = true;
        };
    }, [idProfesor]);

    // CARGAR HORARIOS CUANDO CAMBIAN LOS GRUPOS
    useEffect(() => {
        void cargarHorariosGrupos();
    }, [cargarHorariosGrupos]);

    // CARGAR ALUMNOS POR GRUPO CUANDO CAMBIAN GRUPOS O CLASES
    useEffect(() => {
        void cargarAlumnosGrupos();
    }, [cargarAlumnosGrupos]);

    // CARGA PRINCIPAL
    if (loadingProfesor) {
        return (
            <div className="profesor-dashboard">
                <div className="loading">Cargando dashboard...</div>
            </div>
        );
    }

    if (errorProfesor && !profesor) {
        return (
            <div className="profesor-dashboard">
                <main className="main-content">
                    <div className="dashboard-card">
                        <h2>No se pudo cargar el panel</h2>
                        <p>{errorProfesor}</p>
                        <button
                            className="primary-button"
                            onClick={cerrarSesion}
                        >
                            Volver al inicio de sesión
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="profesor-dashboard">
            {/* SIDEBAR */}
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
                        className={seccion === "reportes" ? "active" : ""}
                        onClick={() => cambiarSeccion("reportes")}
                        type="button"
                    >
                        📊 Reportes
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

            {/* CONTENIDO PRINCIPAL */}
            <main className="main-content">
                {/* HEADER */}
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
                            {profesor?.nombre?.charAt(0)?.toUpperCase() ??
                                "P"}
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
                                    <span>Alumnos únicos</span>
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
                                        <h2>Asistencia de la clase consultada</h2>
                                        <p>
                                            Estas estadísticas corresponden a
                                            la clase que consultaste, no al
                                            historial completo del profesor.
                                        </p>
                                    </div>
                                </div>

                                {claseSeleccionada ? (
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
                                            <strong>
                                                {porcentajeAsistencia}%
                                            </strong>
                                        </div>
                                    </div>
                                ) : (
                                    <p>
                                        Seleccioná una clase desde “Mis clases”
                                        para consultar sus estadísticas.
                                    </p>
                                )}
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
                                    <p>Grupos que tenés asignados.</p>
                                </div>

                                <button
                                    className="primary-button"
                                    onClick={() =>
                                        setMostrarFormularioGrupo(
                                            (anterior) => !anterior,
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
                                                value={
                                                    nuevoGrupo.id_disciplina
                                                }
                                                onChange={(event) =>
                                                    cambiarDatoGrupo(
                                                        "id_disciplina",
                                                        Number(
                                                            event.target.value,
                                                        ),
                                                    )
                                                }
                                                disabled={
                                                    loadingDisciplinas ||
                                                    disciplinas.length === 0
                                                }
                                            >
                                                <option value={0}>
                                                    {loadingDisciplinas
                                                        ? "Cargando disciplinas..."
                                                        : "Seleccioná una disciplina"}
                                                </option>

                                                {disciplinas.map(
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
                                                )}
                                            </select>
                                        </div>

                                        <div className="profile-row">
                                            <span>Nivel</span>

                                            <select
                                                value={nuevoGrupo.nivel}
                                                onChange={(event) =>
                                                    cambiarDatoGrupo(
                                                        "nivel",
                                                        event.target.value,
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
                                                onChange={(event) =>
                                                    cambiarDatoGrupo(
                                                        "cupo_max",
                                                        Number(
                                                            event.target.value,
                                                        ),
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="profile-row">
                                            <span>Día</span>

                                            <select
                                                value={nuevoGrupo.dia_semana}
                                                onChange={(event) =>
                                                    cambiarDatoGrupo(
                                                        "dia_semana",
                                                        event.target.value,
                                                    )
                                                }
                                            >
                                                <option value="Lunes">
                                                    Lunes
                                                </option>
                                                <option value="Martes">
                                                    Martes
                                                </option>
                                                <option value="Miércoles">
                                                    Miércoles
                                                </option>
                                                <option value="Jueves">
                                                    Jueves
                                                </option>
                                                <option value="Viernes">
                                                    Viernes
                                                </option>
                                                <option value="Sábado">
                                                    Sábado
                                                </option>
                                            </select>
                                        </div>

                                        <div className="profile-row">
                                            <span>Hora inicio</span>

                                            <input
                                                type="time"
                                                value={nuevoGrupo.hora_inicio}
                                                onChange={(event) =>
                                                    cambiarDatoGrupo(
                                                        "hora_inicio",
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="profile-row">
                                            <span>Hora fin</span>

                                            <input
                                                type="time"
                                                value={nuevoGrupo.hora_fin}
                                                onChange={(event) =>
                                                    cambiarDatoGrupo(
                                                        "hora_fin",
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </div>

                                        <div
                                            style={{
                                                marginTop: "20px",
                                                display: "flex",
                                                flexWrap: "wrap",
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
                                <div className="dashboard-warning">
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
                                                        : alumnosGrupo.length}
                                                    {" / "}
                                                    {grupo.cupo_max}
                                                </p>

                                                {loadingHorarios ? (
                                                    <div className="loading">
                                                        Cargando horarios...
                                                    </div>
                                                ) : horarios.length > 0 ? (
                                                    <div className="group-schedule">
                                                        {horarios.map(
                                                            (
                                                                horario: HorarioGrupo,
                                                                indice: number,
                                                            ) => (
                                                                <div
                                                                    key={
                                                                        horario.id_horario ??
                                                                        `${grupo.id_grupo}-${indice}`
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
                                                ) : (
                                                    <p>
                                                        No hay horarios
                                                        cargados.
                                                    </p>
                                                )}

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

                            {errorHorarios && (
                                <p className="dashboard-warning">
                                    ⚠️ {errorHorarios}
                                </p>
                            )}

                            {errorAlumnosGrupos && (
                                <p className="dashboard-warning">
                                    ⚠️ {errorAlumnosGrupos}
                                </p>
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
                                        Seleccioná una clase para consultar sus
                                        alumnos y registrar asistencia.
                                    </p>
                                </div>
                            </div>

                            {loadingClases ? (
                                <div className="loading">
                                    Cargando clases...
                                </div>
                            ) : errorClases ? (
                                <div className="dashboard-warning">
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
                                                claseSeleccionada ===
                                                clase.id_clase
                                                    ? "class-card selected"
                                                    : "class-card"
                                            }
                                            key={clase.id_clase}
                                            onClick={() =>
                                                void cargarAlumnosClase(
                                                    clase.id_clase,
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
                                                <p>Nivel: {clase.nivel}</p>
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
                                                        clase.id_clase,
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
                                ) : errorAlumnos ? (
                                    <div className="dashboard-warning">
                                        ⚠️ {errorAlumnos}
                                    </div>
                                ) : alumnos.length === 0 ? (
                                    <div className="empty-state">
                                        <div>🎓</div>
                                        <strong>
                                            No hay alumnos registrados
                                        </strong>
                                        <span>
                                            Esta clase todavía no tiene
                                            alumnos.
                                        </span>
                                    </div>
                                ) : (
                                    <div className="attendance-list">
                                        {alumnos.map((alumno) => {
                                            const idAlumno = Number(
                                                alumno.id_alumno,
                                            );

                                            const asistencia =
                                                asistencias[idAlumno];

                                            const estado = asistencia?.estado;

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
                                                            ?.toUpperCase() ??
                                                            "A"}
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
                                                                    guardando ||
                                                                    guardandoAsistencia !==
                                                                        null
                                                                }
                                                                onClick={() =>
                                                                    void guardarAsistencia(
                                                                        idAlumno,
                                                                        claseSeleccionada,
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
                                                                    guardando ||
                                                                    guardandoAsistencia !==
                                                                        null
                                                                }
                                                                onClick={() =>
                                                                    void guardarAsistencia(
                                                                        idAlumno,
                                                                        claseSeleccionada,
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
                                )}

                                {claseSeleccionada !== null &&
                                    !loadingAsistencias && (
                                        <div
                                            className="stats-grid"
                                            style={{ marginTop: "20px" }}
                                        >
                                            <div className="stat-card">
                                                <span>Presentes</span>
                                                <strong>
                                                    {totalPresentes}
                                                </strong>
                                            </div>

                                            <div className="stat-card">
                                                <span>Ausentes</span>
                                                <strong>
                                                    {totalAusentes}
                                                </strong>
                                            </div>

                                            <div className="stat-card">
                                                <span>Registradas</span>
                                                <strong>
                                                    {totalRegistradas}
                                                </strong>
                                            </div>

                                            <div className="stat-card">
                                                <span>Asistencia</span>
                                                <strong>
                                                    {porcentajeAsistencia}%
                                                </strong>
                                            </div>
                                        </div>
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
                                    {alumnosUnicos.map((alumno) => (
                                        <div
                                            className="attendance-item"
                                            key={alumno.id_alumno}
                                        >
                                            <div className="student-avatar">
                                                {alumno.nombre
                                                    ?.charAt(0)
                                                    ?.toUpperCase() ?? "A"}
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

                            {errorAlumnosGrupos && (
                                <div className="dashboard-warning">
                                    ⚠️ {errorAlumnosGrupos}
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

                            {claseSeleccionada !== null && (
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
                            )}

                            <div className="classes-grid">
                                {clases.map((clase) => (
                                    <div
                                        className={
                                            claseSeleccionada ===
                                            clase.id_clase
                                                ? "class-card selected"
                                                : "class-card"
                                        }
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
                                                    clase.id_clase,
                                                );
                                            }}
                                        >
                                            Tomar asistencia
                                        </button>
                                    </div>
                                ))}
                            </div>
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
                                        Historial de haberes y pagos
                                        registrados.
                                    </p>
                                </div>
                            </div>

                            {loadingLiquidaciones ? (
                                <div className="loading">
                                    Cargando liquidaciones...
                                </div>
                            ) : errorLiquidaciones ? (
                                <div className="dashboard-warning">
                                    ⚠️ {errorLiquidaciones}
                                </div>
                            ) : liquidaciones.length === 0 ? (
                                <div className="empty-state">
                                    <div>💰</div>
                                    <strong>
                                        No hay liquidaciones registradas
                                    </strong>
                                    <span>
                                        Aún no contás con registros de pagos o
                                        haberes.
                                    </span>
                                </div>
                            ) : (
                                <div className="attendance-list">
                                    {liquidaciones.map((liquidacion, index) => (
                                        <div
                                            className="attendance-item"
                                            key={
                                                liquidacion.id_liquidacion ??
                                                index
                                            }
                                        >
                                            <div className="student-avatar">
                                                💰
                                            </div>

                                            <div className="attendance-student">
                                                <strong>
                                                    Período:{" "}
                                                    {liquidacion.mes}/
                                                    {liquidacion.anio}
                                                </strong>

                                                <span>
                                                    Monto: $
                                                    {Number(
                                                        liquidacion.monto_total ??
                                                            0,
                                                    ).toLocaleString("es-AR", {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    })}
                                                </span>
                                            </div>

                                            <div className="attendance-status">
                                                <span
                                                    className={
                                                        liquidacion.estado ===
                                                        "PAGADO"
                                                            ? "status present"
                                                            : "status pending"
                                                    }
                                                >
                                                    {liquidacion.estado ??
                                                        "PENDIENTE"}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* REPORTES */}
                {seccion === "reportes" && (
                    <section className="dashboard-section">
                        <div className="dashboard-card">
                            <div className="card-header">
                                <div>
                                    <span className="section-label">
                                        REPORTES
                                    </span>
                                    <h2>Reportes de alumnos</h2>
                                    <p>
                                        Buscá por nombre, apellido, ID o DNI y
                                        exportá los resultados a CSV.
                                    </p>
                                </div>
                            </div>

                            {loadingAlumnosGrupos && (
                                <div className="loading">
                                    Cargando alumnos...
                                </div>
                            )}

                            {errorAlumnosGrupos && (
                                <div className="dashboard-warning">
                                    ⚠️ {errorAlumnosGrupos}
                                </div>
                            )}

                            <div
                                style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    alignItems: "center",
                                    gap: "10px",
                                    marginBottom: "20px",
                                }}
                            >
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre, ID o DNI..."
                                    value={busquedaAlumnoReporte}
                                    onChange={(event) =>
                                        setBusquedaAlumnoReporte(
                                            event.target.value,
                                        )
                                    }
                                    style={{
                                        padding: "8px 12px",
                                        borderRadius: "6px",
                                        border: "1px solid #ccc",
                                        flex: "1",
                                        minWidth: "220px",
                                    }}
                                />

                                <button
                                    className="primary-button"
                                    onClick={() =>
                                        void exportarReporteAlumnos()
                                    }
                                    disabled={
                                        loadingAlumnosGrupos ||
                                        alumnosFiltradosReporte.length === 0
                                    }
                                >
                                    📥 Exportar CSV (
                                    {alumnosFiltradosReporte.length})
                                </button>
                            </div>

                            {loadingAlumnosGrupos ? null : alumnosFiltradosReporte.length ===
                              0 ? (
                                <div className="empty-state">
                                    <div>🔎</div>
                                    <strong>No hay resultados</strong>
                                    <span>
                                        Probá con otro nombre, ID o DNI.
                                    </span>
                                </div>
                            ) : (
                                <div className="attendance-list">
                                    {alumnosFiltradosReporte.map((alumno) => (
                                        <div
                                            className="attendance-item"
                                            key={alumno.id_alumno}
                                        >
                                            <div className="student-avatar">
                                                {alumno.nombre
                                                    ?.charAt(0)
                                                    ?.toUpperCase() ?? "A"}
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
                                    <p>
                                        Información personal y datos de tu
                                        cuenta.
                                    </p>
                                </div>
                            </div>

                            <div className="profile-info">
                                <div className="profile-row">
                                    <span>Nombre completo:</span>
                                    <strong>
                                        {profesor?.nombre}{" "}
                                        {profesor?.apellido}
                                    </strong>
                                </div>

                                <div className="profile-row">
                                    <span>Email:</span>
                                    <strong>
                                        {usuario?.email ?? "No registrado"}
                                    </strong>
                                </div>

                                <div className="profile-row">
                                    <span>Teléfono:</span>
                                    <strong>
                                        {profesor?.telefono ??
                                            "No registrado"}
                                    </strong>
                                </div>

                                <div className="profile-row">
                                    <span>ID Profesor:</span>
                                    <strong>#{idProfesor ?? "-"}</strong>
                                </div>
                            </div>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export default ProfesorDashboard;
