import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import Swal from "sweetalert2";

import {
    obtenerProfesorPorUsuario,
} from "../../services/profesores.service";

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

import {
    obtenerDisciplinas,
} from "../../services/disciplinas.service";

import {
    obtenerHorariosGrupo,
} from "../../services/horarios.service";

import "./ProfesoresDashboard.css";
import { exportarCSV, fechaLocal } from "../../utils/exportarCsv";
import { obtenerLiquidacionesProfesor, type LiquidacionProfesor } from "../../services/liquidaciones.service";


// ============================================================
// TIPOS
// ============================================================

type Seccion =
    | "inicio"
    | "grupos"
    | "clases"
    | "alumnos"
    | "asistencias"
    | "liquidaciones"
    | "reportes"
    | "perfil";


// ============================================================
// COMPONENTE
// ============================================================

const ProfesorDashboard = () => {

    const navigate = useNavigate();


    // ========================================================
    // USUARIO
    // ========================================================

    const [
        usuario,
        setUsuario,
    ] = useState<any>(null);


    // ========================================================
    // PROFESOR
    // ========================================================

    const [
        profesor,
        setProfesor,
    ] = useState<any>(null);

    const [
        idProfesor,
        setIdProfesor,
    ] = useState<number | null>(null);

    const [
        loadingProfesor,
        setLoadingProfesor,
    ] = useState(true);

    const [
        errorProfesor,
        setErrorProfesor,
    ] = useState("");


    // ========================================================
    // SECCIÓN
    // ========================================================

    const [
        seccion,
        setSeccion,
    ] = useState<Seccion>("inicio");

    const [liquidaciones, setLiquidaciones] = useState<LiquidacionProfesor[]>([]);
    const [loadingLiquidaciones, setLoadingLiquidaciones] = useState(false);
    const [errorLiquidaciones, setErrorLiquidaciones] = useState("");

    const [busquedaAlumnoReporte, setBusquedaAlumnoReporte] = useState("");
    const [filtroAgenda, setFiltroAgenda] = useState<"todas" | "pendientes" | "finalizadas">("todas");


    // ========================================================
    // GRUPOS
    // ========================================================

    const [
        grupos,
        setGrupos,
    ] = useState<Grupo[]>([]);

    const [
        loadingGrupos,
        setLoadingGrupos,
    ] = useState(false);

    const [
        errorGrupos,
        setErrorGrupos,
    ] = useState("");


    // ========================================================
    // CREAR GRUPO
    // ========================================================

    const [
        mostrarFormularioGrupo,
        setMostrarFormularioGrupo,
    ] = useState(false);

    const [
        creandoGrupo,
        setCreandoGrupo,
    ] = useState(false);

    const [
        nuevoGrupo,
        setNuevoGrupo,
    ] = useState({
        id_disciplina: 1,
        nivel: "Principiante",
        cupo_max: 20,
        dia_semana: "Lunes",
        hora_inicio: "18:00",
        hora_fin: "19:00",
    });


    // ========================================================
    // DISCIPLINAS
    // ========================================================

    const [
        disciplinas,
        setDisciplinas,
    ] = useState<any[]>([]);

    const [
        loadingDisciplinas,
        setLoadingDisciplinas,
    ] = useState(false);


    // ========================================================
    // CLASES
    // ========================================================

    const [
        clases,
        setClases,
    ] = useState<Clase[]>([]);

    const [
        loadingClases,
        setLoadingClases,
    ] = useState(false);

    const [
        errorClases,
        setErrorClases,
    ] = useState("");


    // ========================================================
    // CLASE SELECCIONADA
    // ========================================================

    const [
        claseSeleccionada,
        setClaseSeleccionada,
    ] = useState<number | null>(null);


    // ========================================================
    // ALUMNOS
    // ========================================================

    const [
        alumnos,
        setAlumnos,
    ] = useState<AlumnoClase[]>([]);

    const [
        loadingAlumnos,
        setLoadingAlumnos,
    ] = useState(false);

    const [
        errorAlumnos,
        setErrorAlumnos,
    ] = useState("");


    // ========================================================
    // ASISTENCIAS
    // ========================================================

    const [
        asistencias,
        setAsistencias,
    ] = useState<
        Record<number, Asistencia | null>
    >({});

    const [
        loadingAsistencias,
        setLoadingAsistencias,
    ] = useState(false);

    const [
        guardandoAsistencia,
        setGuardandoAsistencia,
    ] = useState<number | null>(null);


    // ========================================================
    // HORARIOS
    // ========================================================

    const [
        horariosGrupo,
        setHorariosGrupo,
    ] = useState<Record<number, any[]>>({});

    const [
        loadingHorarios,
        setLoadingHorarios,
    ] = useState(false);


    // ========================================================
    // ALUMNOS TOTALES
    // ========================================================

    const [
        alumnosPorGrupo,
        setAlumnosPorGrupo,
    ] = useState<
        Record<number, AlumnoClase[]>
    >({});

    const [
        loadingAlumnosGrupos,
        setLoadingAlumnosGrupos,
    ] = useState(false);


    // ========================================================
    // MENSAJES
    // ========================================================

    const mostrarExito = async (
        titulo: string,
        texto: string,
    ) => {

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
    ) => {

        await Swal.fire({
            icon: "error",
            title: titulo,
            text: texto,
            confirmButtonText: "Aceptar",
        });
    };


    // ========================================================
    // OBTENER USUARIO
    // ========================================================

    const obtenerIdUsuario = (): number | null => {

        const usuarioGuardado =
            localStorage.getItem("usuario");

        if (!usuarioGuardado) {
            return null;
        }

        try {

            const usuarioParseado =
                JSON.parse(usuarioGuardado);

            setUsuario(usuarioParseado);

            const id =
                usuarioParseado.id_usuario ??
                usuarioParseado.idUsuario ??
                usuarioParseado.id;

            const idNumero =
                Number(id);

            if (
                !Number.isInteger(idNumero) ||
                idNumero <= 0
            ) {
                return null;
            }

            return idNumero;

        } catch (error) {

            console.error(
                "Error leyendo usuario:",
                error,
            );

            return null;
        }
    };


    // ========================================================
    // CERRAR SESIÓN
    // ========================================================

    const cerrarSesion = () => {

        localStorage.removeItem("usuario");
        localStorage.removeItem("token");

        navigate("/login");
    };


    // ========================================================
    // CARGAR PROFESOR
    // ========================================================

    const cargarProfesor = async () => {

        try {

            setLoadingProfesor(true);
            setErrorProfesor("");

            const idUsuario =
                obtenerIdUsuario();

            if (!idUsuario) {

                setErrorProfesor(
                    "No se pudo obtener el usuario.",
                );

                return;
            }

            const datos =
                await obtenerProfesorPorUsuario(
                    idUsuario,
                );

            console.log(
                "PROFESOR OBTENIDO:",
                datos,
            );

            setProfesor(datos);

            const id =
                Number(
                    datos?.id_profesor,
                );

            if (
                Number.isInteger(id) &&
                id > 0
            ) {

                setIdProfesor(id);

            } else {

                setErrorProfesor(
                    "No se pudo obtener el ID del profesor.",
                );
            }

        } catch (error) {

            console.error(
                "Error obteniendo profesor:",
                error,
            );

            setErrorProfesor(
                "No se pudo cargar la información del profesor.",
            );

        } finally {

            setLoadingProfesor(false);
        }
    };


    // ========================================================
    // CARGAR DISCIPLINAS
    // ========================================================

    const cargarDisciplinas = async () => {

        try {

            setLoadingDisciplinas(true);

            const datos =
                await obtenerDisciplinas();

            console.log(
                "DISCIPLINAS:",
                datos,
            );

            setDisciplinas(
                Array.isArray(datos)
                    ? datos
                    : [],
            );

        } catch (error) {

            console.error(
                "Error obteniendo disciplinas:",
                error,
            );

            setDisciplinas([]);

        } finally {

            setLoadingDisciplinas(false);
        }
    };


    // ========================================================
    // CARGAR GRUPOS
    // ========================================================

    const cargarGrupos = async () => {

        if (!idProfesor) {
            return;
        }

        try {

            setLoadingGrupos(true);
            setErrorGrupos("");

            const datos =
                await obtenerGruposProfesor(
                    idProfesor,
                );

            console.log(
                "GRUPOS DEL PROFESOR:",
                datos,
            );

            setGrupos(
                Array.isArray(datos)
                    ? datos
                    : [],
            );

        } catch (error) {

            console.error(
                "Error obteniendo grupos:",
                error,
            );

            setErrorGrupos(
                "No se pudieron cargar tus grupos.",
            );

            setGrupos([]);

        } finally {

            setLoadingGrupos(false);
        }
    };


    // ========================================================
    // CARGAR CLASES
    // ========================================================

    const cargarClases = async () => {

        if (!idProfesor) {
            return;
        }

        try {

            setLoadingClases(true);
            setErrorClases("");

            const datos =
                await obtenerClasesProfesor(
                    idProfesor,
                );

            console.log(
                "CLASES DEL PROFESOR:",
                datos,
            );

            setClases(
                Array.isArray(datos)
                    ? datos
                    : [],
            );

        } catch (error) {

            console.error(
                "Error obteniendo clases:",
                error,
            );

            setErrorClases(
                "No se pudieron cargar tus clases.",
            );

            setClases([]);

        } finally {

            setLoadingClases(false);
        }
    };


    // ========================================================
    // CARGAR HORARIOS DE LOS GRUPOS
    // ========================================================

    const cargarHorariosGrupos = async () => {

        if (grupos.length === 0) {
            return;
        }

        try {

            setLoadingHorarios(true);

            const resultados =
                await Promise.all(
                    grupos.map(
                        async (grupo) => {

                            try {

                                const horarios =
                                    await obtenerHorariosGrupo(
                                        grupo.id_grupo,
                                    );

                                return {
                                    idGrupo:
                                        grupo.id_grupo,

                                    horarios:
                                        Array.isArray(
                                            horarios,
                                        )
                                            ? horarios
                                            : [],
                                };

                            } catch (error) {

                                console.error(
                                    `Error obteniendo horarios del grupo ${grupo.id_grupo}:`,
                                    error,
                                );

                                return {
                                    idGrupo:
                                        grupo.id_grupo,

                                    horarios: [],
                                };
                            }
                        },
                    ),
                );

            const mapa: Record<
                number,
                any[]
            > = {};

            resultados.forEach(
                (resultado) => {

                    mapa[
                        resultado.idGrupo
                    ] =
                        resultado.horarios;
                },
            );

            setHorariosGrupo(mapa);

        } finally {

            setLoadingHorarios(false);
        }
    };


    // ========================================================
    // CARGAR ALUMNOS DE LOS GRUPOS
    // ========================================================

    const cargarAlumnosGrupos = async () => {

        if (grupos.length === 0) {
            setAlumnosPorGrupo({});
            return;
        }

        try {

            setLoadingAlumnosGrupos(true);

            const resultados =
                await Promise.all(
                    grupos.map(
                        async (grupo) => {

                            try {

                                const clasesGrupo =
                                    clases.filter(
                                        (clase) =>
                                            clase.id_grupo ===
                                            grupo.id_grupo,
                                    );

                                const mapaAlumnos =
                                    new Map<
                                        number,
                                        AlumnoClase
                                    >();

                                for (
                                    const clase
                                    of clasesGrupo
                                ) {

                                    try {

                                        const alumnosClase =
                                            await obtenerAlumnosPorClase(
                                                clase.id_clase,
                                            );

                                        if (
                                            Array.isArray(
                                                alumnosClase,
                                            )
                                        ) {

                                            alumnosClase.forEach(
                                                (
                                                    alumno,
                                                ) => {

                                                    mapaAlumnos.set(
                                                        alumno.id_alumno,
                                                        alumno,
                                                    );
                                                },
                                            );
                                        }

                                    } catch (error) {

                                        console.error(
                                            `Error obteniendo alumnos de clase ${clase.id_clase}:`,
                                            error,
                                        );
                                    }
                                }

                                return {
                                    idGrupo:
                                        grupo.id_grupo,

                                    alumnos:
                                        Array.from(
                                            mapaAlumnos.values(),
                                        ),
                                };

                            } catch (error) {

                                console.error(
                                    error,
                                );

                                return {
                                    idGrupo:
                                        grupo.id_grupo,

                                    alumnos: [],
                                };
                            }
                        },
                    ),
                );

            const mapa: Record<
                number,
                AlumnoClase[]
            > = {};

            resultados.forEach(
                (resultado) => {

                    mapa[
                        resultado.idGrupo
                    ] =
                        resultado.alumnos;
                },
            );

            setAlumnosPorGrupo(mapa);

        } finally {

            setLoadingAlumnosGrupos(false);
        }
    };


    // ========================================================
    // CARGAR ALUMNOS DE UNA CLASE
    // ========================================================

    const cargarAlumnosClase = async (
        idClase: number,
    ) => {

        try {

            setLoadingAlumnos(true);
            setLoadingAsistencias(true);

            setErrorAlumnos("");

            setClaseSeleccionada(
                idClase,
            );

            const data =
                await obtenerAlumnosPorClase(
                    idClase,
                );

            const alumnosClase =
                Array.isArray(data)
                    ? data
                    : [];

            console.log(
                "ALUMNOS DE LA CLASE:",
                alumnosClase,
            );

            setAlumnos(
                alumnosClase,
            );


            // ==================================================
            // ASISTENCIAS
            // ==================================================

            const resultados =
                await Promise.all(

                    alumnosClase.map(
                        async (
                            alumno,
                        ) => {

                            const idAlumno =
                                Number(
                                    alumno.id_alumno,
                                );

                            if (
                                !Number.isInteger(
                                    idAlumno,
                                ) ||
                                idAlumno <= 0
                            ) {

                                return {
                                    idAlumno: 0,
                                    asistencia: null,
                                };
                            }

                            try {

                                const asistencia =
                                    await obtenerAsistenciaAlumnoClase(
                                        idAlumno,
                                        idClase,
                                    );

                                return {

                                    idAlumno,

                                    asistencia:
                                        Array.isArray(
                                            asistencia,
                                        ) &&
                                        asistencia.length >
                                            0
                                            ? asistencia[0]
                                            : null,
                                };

                            } catch (error) {

                                console.error(
                                    `Error obteniendo asistencia del alumno ${idAlumno}:`,
                                    error,
                                );

                                return {
                                    idAlumno,
                                    asistencia: null,
                                };
                            }
                        },
                    ),
                );


            const mapa:
                Record<
                    number,
                    Asistencia | null
                > = {};

            resultados.forEach(
                (
                    resultado,
                ) => {

                    if (
                        resultado.idAlumno >
                        0
                    ) {

                        mapa[
                            resultado.idAlumno
                        ] =
                            resultado.asistencia;
                    }
                },
            );

            setAsistencias(
                mapa,
            );

        } catch (error) {

            console.error(
                "Error obteniendo alumnos:",
                error,
            );

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


    // ========================================================
    // REGISTRAR ASISTENCIA
    // ========================================================

    const guardarAsistencia = async (
        idAlumno: number,
        idClase: number,
        estado: string,
    ) => {

        if (
            !Number.isInteger(idAlumno) ||
            idAlumno <= 0
        ) {

            await mostrarError(
                "Error",
                "El ID del alumno no es válido.",
            );

            return;
        }

        if (
            !Number.isInteger(idClase) ||
            idClase <= 0
        ) {

            await mostrarError(
                "Error",
                "El ID de la clase no es válido.",
            );

            return;
        }

        if (
            asistencias[idAlumno]
        ) {

            return;
        }

        try {

            setGuardandoAsistencia(
                idAlumno,
            );

            await registrarAsistencia({
                id_alumno:
                    idAlumno,

                id_clase:
                    idClase,

                estado,

                observaciones:
                    "",
            });


            setAsistencias(
                (anteriores) => ({
                    ...anteriores,

                    [idAlumno]: {

                        id_asistencia:
                            0,

                        id_alumno:
                            idAlumno,

                        id_clase:
                            idClase,

                        estado,

                        observaciones:
                            "",
                    },
                }),
            );


            await mostrarExito(
                "Asistencia registrada",
                `El alumno fue marcado como ${
                    estado === "presente"
                        ? "presente"
                        : "ausente"
                }.`,
            );

        } catch (error: any) {

            console.error(
                "Error registrando asistencia:",
                error,
            );

            const mensaje =
                error?.response?.data?.message ??
                "No se pudo registrar la asistencia.";

            await mostrarError(
                "Error",
                Array.isArray(mensaje)
                    ? mensaje.join(", ")
                    : mensaje,
            );

        } finally {

            setGuardandoAsistencia(
                null,
            );
        }
    };


    // ========================================================
    // CREAR GRUPO
    // ========================================================

    const cambiarDatoGrupo = (
        campo: string,
        valor: string | number,
    ) => {

        setNuevoGrupo(
            (anterior) => ({
                ...anterior,
                [campo]: valor,
            }),
        );
    };


    const ejecutarCrearGrupo =
        async () => {

            if (!idProfesor) {

                await mostrarError(
                    "Error",
                    "No se pudo obtener el ID del profesor.",
                );

                return;
            }

            if (
                !nuevoGrupo.id_disciplina
            ) {

                await mostrarError(
                    "Error",
                    "Seleccioná una disciplina.",
                );

                return;
            }

            if (
                !nuevoGrupo.nivel.trim()
            ) {

                await mostrarError(
                    "Error",
                    "Ingresá el nivel del grupo.",
                );

                return;
            }

            if (
                !nuevoGrupo.cupo_max ||
                nuevoGrupo.cupo_max <= 0
            ) {

                await mostrarError(
                    "Error",
                    "El cupo máximo debe ser mayor a 0.",
                );

                return;
            }

            if (
                !nuevoGrupo.dia_semana
            ) {

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

            if (
                nuevoGrupo.hora_inicio >=
                nuevoGrupo.hora_fin
            ) {

                await mostrarError(
                    "Error",
                    "La hora de inicio debe ser anterior a la hora de finalización.",
                );

                return;
            }

            try {

                setCreandoGrupo(true);

                const datosGrupo = {

                    id_disciplina:
                        Number(
                            nuevoGrupo.id_disciplina,
                        ),

                    nivel:
                        nuevoGrupo.nivel,

                    cupo_max:
                        Number(
                            nuevoGrupo.cupo_max,
                        ),

                    id_profesor:
                        Number(
                            idProfesor,
                        ),

                    horarios: [

                        {
                            dia_semana:
                                nuevoGrupo.dia_semana,

                            hora_inicio:
                                nuevoGrupo.hora_inicio,

                            hora_fin:
                                nuevoGrupo.hora_fin,
                        },

                    ],
                };

                console.log(
                    "CREANDO GRUPO:",
                    datosGrupo,
                );

                await crearGrupo(
                    datosGrupo,
                );

                setMostrarFormularioGrupo(
                    false,
                );

                setNuevoGrupo({
                    id_disciplina:
                        disciplinas[0]
                            ?.id_disciplina ??
                        1,

                    nivel:
                        "Principiante",

                    cupo_max:
                        20,

                    dia_semana:
                        "Lunes",

                    hora_inicio:
                        "18:00",

                    hora_fin:
                        "19:00",
                });

                await cargarGrupos();

                await mostrarExito(
                    "Grupo creado",
                    "El grupo fue creado correctamente.",
                );

            } catch (error: any) {

                console.error(
                    "ERROR CREANDO GRUPO:",
                    error,
                );

                const mensaje =
                    error?.response?.data?.message ??
                    "No se pudo crear el grupo.";

                await mostrarError(
                    "Error",
                    Array.isArray(mensaje)
                        ? mensaje.join(", ")
                        : mensaje,
                );

            } finally {

                setCreandoGrupo(
                    false,
                );
            }
        };


    // ========================================================
    // ESTADÍSTICAS
    // ========================================================

    const totalAlumnos =
        useMemo(() => {

            const ids =
                new Set<number>();

            Object.values(
                alumnosPorGrupo,
            ).forEach(
                (
                    lista,
                ) => {

                    lista.forEach(
                        (
                            alumno,
                        ) => {

                            ids.add(
                                alumno.id_alumno,
                            );
                        },
                    );
                },
            );

            return ids.size;

        }, [
            alumnosPorGrupo,
        ]);


    const totalPresentes =
        useMemo(() => {

            return Object.values(
                asistencias,
            ).filter(
                (
                    asistencia,
                ) =>
                    asistencia?.estado ===
                    "presente",
            ).length;

        }, [
            asistencias,
        ]);


    const totalAusentes =
        useMemo(() => {

            return Object.values(
                asistencias,
            ).filter(
                (
                    asistencia,
                ) =>
                    asistencia?.estado ===
                    "ausente",
            ).length;

        }, [
            asistencias,
        ]);


    const totalRegistradas =
        totalPresentes +
        totalAusentes;


    const porcentajeAsistencia =
        totalRegistradas > 0
            ? Math.round(
                  (
                      totalPresentes /
                      totalRegistradas
                  ) *
                      100,
              )
            : 0;


    // ========================================================
    // CLASE SELECCIONADA
    // ========================================================

    const claseActual =
        clases.find(
            (clase) =>
                clase.id_clase ===
                claseSeleccionada,
        );


    // ========================================================
    // CAMBIAR SECCIÓN
    // ========================================================

    const cambiarSeccion = (
        nuevaSeccion: Seccion,
    ) => {

        setSeccion(
            nuevaSeccion,
        );

        if (
            nuevaSeccion !==
            "clases"
        ) {

            setClaseSeleccionada(
                null,
            );

            setAlumnos(
                [],
            );

            setAsistencias(
                {},
            );
        }
    };


    // ========================================================
    // EFECTO INICIAL
    // ========================================================

    // ========================================================
    // CARGAR LIQUIDACIONES DEL PROFESOR
    // ========================================================
    useEffect(() => {
        if (!idProfesor) return;

        let cancelado = false;
        const cargarLiquidaciones = async () => {
            try {
                setLoadingLiquidaciones(true);
                setErrorLiquidaciones("");
                const datos = await obtenerLiquidacionesProfesor(idProfesor);
                if (!cancelado) setLiquidaciones(datos);
            } catch (error) {
                console.error("Error cargando liquidaciones:", error);
                if (!cancelado) {
                    setErrorLiquidaciones("No se pudieron cargar las liquidaciones. Verificá la conexión con el servidor.");
                    setLiquidaciones([]);
                }
            } finally {
                if (!cancelado) setLoadingLiquidaciones(false);
            }
        };

        void cargarLiquidaciones();
        return () => { cancelado = true; };
    }, [idProfesor]);

    useEffect(
        () => {

            cargarProfesor();
            cargarDisciplinas();

        },
        [],
    );


    // ========================================================
    // CUANDO TENEMOS PROFESOR
    // ========================================================

    useEffect(
        () => {

            if (!idProfesor) {
                return;
            }

            cargarGrupos();
            cargarClases();

        },
        [
            idProfesor,
        ],
    );


    // ========================================================
    // CUANDO CAMBIAN LOS GRUPOS
    // ========================================================

    useEffect(
        () => {

            if (
                grupos.length === 0
            ) {

                setHorariosGrupo({});
                return;
            }

            cargarHorariosGrupos();

        },
        [
            grupos,
        ],
    );


    // ========================================================
    // CUANDO TENEMOS GRUPOS + CLASES
    // ========================================================

    useEffect(
        () => {

            if (
                grupos.length === 0 ||
                clases.length === 0
            ) {

                setAlumnosPorGrupo({});
                return;
            }

            cargarAlumnosGrupos();

        },
        [
            grupos,
            clases,
        ],
    );


    // ========================================================
    // LOADING
    // ========================================================

    if (loadingProfesor) {

        return (
            <div className="profesor-dashboard">

                <div className="loading">

                    Cargando dashboard...

                </div>

            </div>
        );
    }


    // ========================================================
    // RENDER
    // ========================================================

    return (

        <div className="profesor-dashboard">


            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="sidebar">

                <div className="sidebar-header">

                    <h2>
                        Academia
                    </h2>

                    <span>
                        Panel de profesor
                    </span>

                </div>


                <nav className="sidebar-nav">

                    <button
                        className={
                            seccion ===
                            "inicio"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            cambiarSeccion(
                                "inicio",
                            )
                        }
                    >
                        🏠 Inicio
                    </button>


                    <button
                        className={
                            seccion ===
                            "grupos"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            cambiarSeccion(
                                "grupos",
                            )
                        }
                    >
                        👥 Mis grupos
                    </button>


                    <button
                        className={
                            seccion ===
                            "clases"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            cambiarSeccion(
                                "clases",
                            )
                        }
                    >
                        📚 Mis clases
                    </button>


                    <button
                        className={
                            seccion ===
                            "alumnos"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            cambiarSeccion(
                                "alumnos",
                            )
                        }
                    >
                        🎓 Mis alumnos
                    </button>


                    <button
                        className={
                            seccion ===
                            "asistencias"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            cambiarSeccion(
                                "asistencias",
                            )
                        }
                    >
                        ✅ Asistencias
                    </button>


                    <button
                        className={
                            seccion ===
                            "liquidaciones"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            cambiarSeccion(
                                "liquidaciones",
                            )
                        }
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
                        className={
                            seccion ===
                            "perfil"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            cambiarSeccion(
                                "perfil",
                            )
                        }
                    >
                        👤 Mi perfil
                    </button>

                </nav>


                <div className="sidebar-footer">

                    <button
                        className="logout-button"
                        onClick={
                            cerrarSesion
                        }
                    >
                        🚪 Cerrar sesión
                    </button>

                </div>

            </aside>


            {/* =================================================
                MAIN
            ================================================= */}

            <main className="main-content">


                {/* =================================================
                    HEADER
                ================================================= */}

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
                                ?.toUpperCase() ??
                                "P"}

                        </div>

                        <div>

                            <strong>

                                {
                                    profesor?.nombre
                                }{" "}

                                {
                                    profesor?.apellido
                                }

                            </strong>

                            <span>
                                Profesor
                            </span>

                        </div>

                    </div>

                </header>


                {/* =================================================
                    INICIO
                ================================================= */}

                {seccion ===
                    "inicio" && (

                    <section className="dashboard-section">

                        <div className="dashboard-card">

                            <div className="card-header">

                                <div>

                                    <span className="section-label">
                                        INICIO
                                    </span>

                                    <h2>
                                        Bienvenido al panel
                                    </h2>

                                    <p>
                                        Desde acá podés administrar tus grupos,
                                        clases, alumnos y asistencias.
                                    </p>

                                </div>

                            </div>


                            <div className="stats-grid">

                                <div className="stat-card">

                                    <span>
                                        Grupos
                                    </span>

                                    <strong>
                                        {grupos.length}
                                    </strong>

                                </div>


                                <div className="stat-card">

                                    <span>
                                        Clases
                                    </span>

                                    <strong>
                                        {clases.length}
                                    </strong>

                                </div>


                                <div className="stat-card">

                                    <span>
                                        Alumnos
                                    </span>

                                    <strong>
                                        {loadingAlumnosGrupos
                                            ? "..."
                                            : totalAlumnos}
                                    </strong>

                                </div>


                                <div className="stat-card">

                                    <span>
                                        Profesor
                                    </span>

                                    <strong>
                                        #{idProfesor ?? "-"}
                                    </strong>

                                </div>

                            </div>


                            <div
                                className="dashboard-card"
                                style={{
                                    marginTop:
                                        "25px",
                                }}
                            >

                                <div className="card-header">

                                    <div>

                                        <span className="section-label">
                                            RESUMEN
                                        </span>

                                        <h2>
                                            Actividad
                                        </h2>

                                    </div>

                                </div>


                                <div className="stats-grid">

                                    <div className="stat-card">

                                        <span>
                                            Presentes
                                        </span>

                                        <strong>
                                            {totalPresentes}
                                        </strong>

                                    </div>


                                    <div className="stat-card">

                                        <span>
                                            Ausentes
                                        </span>

                                        <strong>
                                            {totalAusentes}
                                        </strong>

                                    </div>


                                    <div className="stat-card">

                                        <span>
                                            Registradas
                                        </span>

                                        <strong>
                                            {totalRegistradas}
                                        </strong>

                                    </div>


                                    <div className="stat-card">

                                        <span>
                                            Asistencia
                                        </span>

                                        <strong>
                                            {porcentajeAsistencia}%
                                        </strong>

                                    </div>

                                </div>

                            </div>


                            <div
                                className="dashboard-card"
                                style={{
                                    marginTop:
                                        "25px",
                                }}
                            >

                                <div className="card-header">

                                    <div>

                                        <span className="section-label">
                                            ACCIONES
                                        </span>

                                        <h2>
                                            Accesos rápidos
                                        </h2>

                                    </div>

                                </div>


                                <div
                                    style={{
                                        display:
                                            "flex",

                                        flexWrap:
                                            "wrap",

                                        gap:
                                            "12px",
                                    }}
                                >

                                    <button
                                        className="primary-button"
                                        onClick={() =>
                                            cambiarSeccion(
                                                "grupos",
                                            )
                                        }
                                    >
                                        👥 Ver grupos
                                    </button>


                                    <button
                                        className="primary-button"
                                        onClick={() =>
                                            cambiarSeccion(
                                                "clases",
                                            )
                                        }
                                    >
                                        📚 Ver clases
                                    </button>


                                    <button
                                        className="primary-button"
                                        onClick={() =>
                                            cambiarSeccion(
                                                "alumnos",
                                            )
                                        }
                                    >
                                        🎓 Ver alumnos
                                    </button>


                                    <button
                                        className="primary-button"
                                        onClick={() =>
                                            cambiarSeccion(
                                                "asistencias",
                                            )
                                        }
                                    >
                                        ✅ Asistencias
                                    </button>

                                </div>

                            </div>

                        </div>

                    </section>
                )}


                {/* =================================================
                    GRUPOS
                ================================================= */}

                {seccion ===
                    "grupos" && (

                    <section className="dashboard-section">

                        <div className="dashboard-card">

                            <div className="card-header">

                                <div>

                                    <span className="section-label">
                                        GRUPOS
                                    </span>

                                    <h2>
                                        Mis grupos
                                    </h2>

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
                                    style={{
                                        marginTop:
                                            "20px",
                                    }}
                                >

                                    <div className="card-header">

                                        <div>

                                            <span className="section-label">
                                                NUEVO GRUPO
                                            </span>

                                            <h2>
                                                Crear grupo
                                            </h2>

                                            <p>
                                                Completá los datos del nuevo grupo.
                                            </p>

                                        </div>

                                    </div>


                                    <div className="profile-info">


                                        <div className="profile-row">

                                            <span>
                                                Disciplina
                                            </span>

                                            <select
                                                value={
                                                    nuevoGrupo.id_disciplina
                                                }
                                                onChange={(
                                                    e,
                                                ) =>
                                                    cambiarDatoGrupo(
                                                        "id_disciplina",
                                                        Number(
                                                            e.target.value,
                                                        ),
                                                    )
                                                }
                                                disabled={
                                                    loadingDisciplinas
                                                }
                                            >

                                                {loadingDisciplinas ? (

                                                    <option>
                                                        Cargando...
                                                    </option>

                                                ) : (

                                                    disciplinas.map(
                                                        (
                                                            disciplina,
                                                        ) => (

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

                                            <span>
                                                Nivel
                                            </span>

                                            <select
                                                value={
                                                    nuevoGrupo.nivel
                                                }
                                                onChange={(
                                                    e,
                                                ) =>
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

                                            <span>
                                                Cupo máximo
                                            </span>

                                            <input
                                                type="number"
                                                min="1"
                                                value={
                                                    nuevoGrupo.cupo_max
                                                }
                                                onChange={(
                                                    e,
                                                ) =>
                                                    cambiarDatoGrupo(
                                                        "cupo_max",
                                                        Number(
                                                            e.target.value,
                                                        ),
                                                    )
                                                }
                                            />

                                        </div>


                                        <div className="profile-row">

                                            <span>
                                                Día
                                            </span>

                                            <select
                                                value={
                                                    nuevoGrupo.dia_semana
                                                }
                                                onChange={(
                                                    e,
                                                ) =>
                                                    cambiarDatoGrupo(
                                                        "dia_semana",
                                                        e.target.value,
                                                    )
                                                }
                                            >

                                                <option>
                                                    Lunes
                                                </option>

                                                <option>
                                                    Martes
                                                </option>

                                                <option>
                                                    Miércoles
                                                </option>

                                                <option>
                                                    Jueves
                                                </option>

                                                <option>
                                                    Viernes
                                                </option>

                                                <option>
                                                    Sábado
                                                </option>

                                            </select>

                                        </div>


                                        <div className="profile-row">

                                            <span>
                                                Hora inicio
                                            </span>

                                            <input
                                                type="time"
                                                value={
                                                    nuevoGrupo.hora_inicio
                                                }
                                                onChange={(
                                                    e,
                                                ) =>
                                                    cambiarDatoGrupo(
                                                        "hora_inicio",
                                                        e.target.value,
                                                    )
                                                }
                                            />

                                        </div>


                                        <div className="profile-row">

                                            <span>
                                                Hora fin
                                            </span>

                                            <input
                                                type="time"
                                                value={
                                                    nuevoGrupo.hora_fin
                                                }
                                                onChange={(
                                                    e,
                                                ) =>
                                                    cambiarDatoGrupo(
                                                        "hora_fin",
                                                        e.target.value,
                                                    )
                                                }
                                            />

                                        </div>


                                        <div
                                            style={{
                                                marginTop:
                                                    "20px",

                                                display:
                                                    "flex",

                                                gap:
                                                    "10px",
                                            }}
                                        >

                                            <button
                                                className="primary-button"
                                                onClick={
                                                    ejecutarCrearGrupo
                                                }
                                                disabled={
                                                    creandoGrupo
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

                                    <div>
                                        👥
                                    </div>

                                    <strong>
                                        No tenés grupos
                                    </strong>

                                    <span>
                                        Todavía no hay grupos asignados.
                                    </span>

                                </div>

                            ) : (

                                <div className="groups-grid">

                                    {grupos.map(
                                        (
                                            grupo,
                                        ) => {

                                            const alumnosGrupo =
                                                alumnosPorGrupo[
                                                    grupo.id_grupo
                                                ] ??
                                                [];

                                            const horarios =
                                                horariosGrupo[
                                                    grupo.id_grupo
                                                ] ??
                                                grupo.horarios ??
                                                [];

                                            return (

                                                <div
                                                    className="group-card"
                                                    key={
                                                        grupo.id_grupo
                                                    }
                                                >

                                                    <div className="group-card-header">

                                                        <span>
                                                            {
                                                                grupo.disciplina
                                                            }
                                                        </span>

                                                        <span>
                                                            {
                                                                grupo.nivel
                                                            }
                                                        </span>

                                                    </div>


                                                    <h3>
                                                        {
                                                            grupo.disciplina
                                                        }
                                                    </h3>


                                                    <p>
                                                        Nivel:{" "}
                                                        {
                                                            grupo.nivel
                                                        }
                                                    </p>


                                                    <p>
                                                        👥 Alumnos:{" "}
                                                        {
                                                            loadingAlumnosGrupos
                                                                ? "..."
                                                                : alumnosGrupo.length
                                                        }
                                                        {" / "}
                                                        {
                                                            grupo.cupo_max
                                                        }
                                                    </p>


                                                    {/* =================================================
                                                        HORARIOS
                                                    ================================================= */}

                                                    {loadingHorarios ? (

                                                        <div className="loading">
                                                            Cargando horarios...
                                                        </div>

                                                    ) : horarios.length >
                                                        0 ? (

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
                                                                        }

                                                                        {" - "}

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
                                                            marginTop:
                                                                "15px",
                                                        }}
                                                        onClick={() =>
                                                            cambiarSeccion(
                                                                "clases",
                                                            )
                                                        }
                                                    >
                                                        📚 Ver clases
                                                    </button>

                                                </div>

                                            );
                                        },
                                    )}

                                </div>

                            )}

                        </div>

                    </section>
                )}


                {/* =================================================
                    CLASES
                ================================================= */}

                {seccion ===
                    "clases" && (

                    <section className="dashboard-section">

                        <div className="dashboard-card">

                            <div className="card-header">

                                <div>

                                    <span className="section-label">
                                        CLASES
                                    </span>

                                    <h2>
                                        Mis clases
                                    </h2>

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

                                <div className="dashboard-warning">
                                    ⚠️ {errorClases}
                                </div>

                            ) : clases.length === 0 ? (

                                <div className="empty-state">

                                    <div>
                                        📚
                                    </div>

                                    <strong>
                                        No tenés clases
                                    </strong>

                                    <span>
                                        No hay clases asignadas actualmente.
                                    </span>

                                </div>

                            ) : (

                                <div className="classes-grid">

                                    {clases.map(
                                        (
                                            clase,
                                        ) => (

                                            <div
                                                className={
                                                    claseSeleccionada ===
                                                    clase.id_clase
                                                        ? "class-card selected"
                                                        : "class-card"
                                                }
                                                key={
                                                    clase.id_clase
                                                }
                                                onClick={() =>
                                                    cargarAlumnosClase(
                                                        clase.id_clase,
                                                    )
                                                }
                                            >

                                                <div className="class-card-header">

                                                    <span>
                                                        Clase
                                                    </span>

                                                    <span>
                                                        #
                                                        {
                                                            clase.id_clase
                                                        }
                                                    </span>

                                                </div>


                                                <h3>
                                                    {
                                                        clase.disciplina ??
                                                        "Clase"
                                                    }
                                                </h3>


                                                {clase.nivel && (

                                                    <p>
                                                        Nivel:{" "}
                                                        {
                                                            clase.nivel
                                                        }
                                                    </p>

                                                )}


                                                <p>
                                                    Grupo:{" "}
                                                    {
                                                        clase.id_grupo
                                                    }
                                                </p>


                                                {clase.fecha && (

                                                    <p>
                                                        📅{" "}
                                                        {
                                                            clase.fecha
                                                        }
                                                    </p>

                                                )}


                                                {clase.hora_inicio && (

                                                    <p>
                                                        🕐{" "}
                                                        {
                                                            clase.hora_inicio
                                                        }

                                                        {" - "}

                                                        {
                                                            clase.hora_fin
                                                        }
                                                    </p>

                                                )}


                                                {clase.estado && (

                                                    <p>
                                                        Estado:{" "}
                                                        {
                                                            clase.estado
                                                        }
                                                    </p>

                                                )}


                                                <button
                                                    className="primary-button"
                                                    onClick={(
                                                        event,
                                                    ) => {

                                                        event.stopPropagation();

                                                        cargarAlumnosClase(
                                                            clase.id_clase,
                                                        );
                                                    }}
                                                >
                                                    Ver alumnos
                                                </button>

                                            </div>
                                        ),
                                    )}

                                </div>

                            )}

                        </div>


                        {claseSeleccionada && (

                            <div className="dashboard-card class-students">

                                <div className="card-header">

                                    <div>

                                        <span className="section-label">
                                            ASISTENCIA
                                        </span>

                                        <h2>
                                            Alumnos de la clase
                                        </h2>

                                        {claseActual && (

                                            <p>
                                                {
                                                    claseActual.disciplina ??
                                                    "Clase"
                                                }
                                                {" · "}
                                                {claseActual.fecha}
                                            </p>

                                        )}

                                    </div>


                                    <button
                                        className="outline-button"
                                        onClick={() => {

                                            setClaseSeleccionada(
                                                null,
                                            );

                                            setAlumnos(
                                                [],
                                            );

                                            setAsistencias(
                                                {},
                                            );

                                        }}
                                    >
                                        Cerrar
                                    </button>

                                </div>


                                {loadingAlumnos ||
                                loadingAsistencias ? (

                                    <div className="loading">
                                        Cargando alumnos y asistencias...
                                    </div>

                                ) : errorAlumnos ? (

                                    <div className="dashboard-warning">
                                        ⚠️ {errorAlumnos}
                                    </div>

                                ) : alumnos.length === 0 ? (

                                    <div className="empty-state">

                                        <div>
                                            🎓
                                        </div>

                                        <strong>
                                            No hay alumnos registrados
                                        </strong>

                                        <span>
                                            Esta clase todavía no tiene alumnos.
                                        </span>

                                    </div>

                                ) : (

                                    <div className="attendance-list">

                                        {alumnos.map(
                                            (
                                                alumno,
                                            ) => {

                                                const idAlumno =
                                                    Number(
                                                        alumno.id_alumno,
                                                    );

                                                const asistencia =
                                                    asistencias[
                                                        idAlumno
                                                    ];

                                                const estado =
                                                    asistencia?.estado;

                                                const guardando =
                                                    guardandoAsistencia ===
                                                    idAlumno;

                                                return (

                                                    <div
                                                        className="attendance-item"
                                                        key={
                                                            idAlumno
                                                        }
                                                    >

                                                        <div className="student-avatar">

                                                            {alumno.nombre
                                                                ?.charAt(
                                                                    0,
                                                                )
                                                                ?.toUpperCase()}

                                                        </div>


                                                        <div className="attendance-student">

                                                            <strong>
                                                                {
                                                                    alumno.nombre
                                                                }{" "}
                                                                {
                                                                    alumno.apellido
                                                                }
                                                            </strong>

                                                            <span>
                                                                ID Alumno:{" "}
                                                                {
                                                                    idAlumno
                                                                }
                                                            </span>

                                                            {alumno.dni && (

                                                                <span>
                                                                    DNI:{" "}
                                                                    {
                                                                        alumno.dni
                                                                    }
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
                                                                        guardando
                                                                    }
                                                                    onClick={() =>
                                                                        guardarAsistencia(
                                                                            idAlumno,
                                                                            claseSeleccionada,
                                                                            "presente",
                                                                        )
                                                                    }
                                                                >
                                                                    {
                                                                        guardando
                                                                            ? "Guardando..."
                                                                            : "✓ Presente"
                                                                    }
                                                                </button>


                                                                <button
                                                                    className="attendance-absent"
                                                                    disabled={
                                                                        guardando
                                                                    }
                                                                    onClick={() =>
                                                                        guardarAsistencia(
                                                                            idAlumno,
                                                                            claseSeleccionada,
                                                                            "ausente",
                                                                        )
                                                                    }
                                                                >
                                                                    {
                                                                        guardando
                                                                            ? "Guardando..."
                                                                            : "✕ Ausente"
                                                                    }
                                                                </button>

                                                            </div>

                                                        )}

                                                    </div>

                                                );
                                            },
                                        )}

                                    </div>

                                )}

                            </div>

                        )}

                    </section>
                )}


                {/* =================================================
                    ALUMNOS
                ================================================= */}

                {seccion ===
                    "alumnos" && (

                    <section className="dashboard-section">

                        <div className="dashboard-card">

                            <div className="card-header">

                                <div>

                                    <span className="section-label">
                                        ALUMNOS
                                    </span>

                                    <h2>
                                        Mis alumnos
                                    </h2>

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

                                    <div>
                                        🎓
                                    </div>

                                    <strong>
                                        No hay alumnos
                                    </strong>

                                    <span>
                                        Todavía no hay alumnos asociados a tus clases.
                                    </span>

                                </div>

                            ) : (

                                <div className="attendance-list">

                                    {Object.values(
                                        alumnosPorGrupo,
                                    )
                                        .flat()
                                        .filter(
                                            (
                                                alumno,
                                                indice,
                                                array,
                                            ) =>
                                                array.findIndex(
                                                    (
                                                        otro,
                                                    ) =>
                                                        otro.id_alumno ===
                                                        alumno.id_alumno,
                                                ) ===
                                                indice,
                                        )
                                        .map(
                                            (
                                                alumno,
                                            ) => (

                                                <div
                                                    className="attendance-item"
                                                    key={
                                                        alumno.id_alumno
                                                    }
                                                >

                                                    <div className="student-avatar">

                                                        {alumno.nombre
                                                            ?.charAt(
                                                                0,
                                                            )
                                                            ?.toUpperCase()}

                                                    </div>


                                                    <div className="attendance-student">

                                                        <strong>
                                                            {
                                                                alumno.nombre
                                                            }{" "}
                                                            {
                                                                alumno.apellido
                                                            }
                                                        </strong>

                                                        <span>
                                                            ID Alumno:{" "}
                                                            {
                                                                alumno.id_alumno
                                                            }
                                                        </span>

                                                        {alumno.dni && (

                                                            <span>
                                                                DNI:{" "}
                                                                {
                                                                    alumno.dni
                                                                }
                                                            </span>

                                                        )}

                                                    </div>

                                                </div>

                                            ),
                                        )}

                                </div>

                            )}

                        </div>

                    </section>
                )}


                {/* =================================================
                    ASISTENCIAS
                ================================================= */}

                {seccion ===
                    "asistencias" && (

                    <section className="dashboard-section">

                        <div className="dashboard-card">

                            <div className="card-header">

                                <div>

                                    <span className="section-label">
                                        ASISTENCIAS
                                    </span>

                                    <h2>
                                        Registro de asistencias
                                    </h2>

                                    <p>
                                        Seleccioná una clase para consultar
                                        y registrar la asistencia.
                                    </p>

                                </div>

                            </div>


                            <div className="stats-grid">

                                <div className="stat-card">

                                    <span>
                                        Presentes
                                    </span>

                                    <strong>
                                        {totalPresentes}
                                    </strong>

                                </div>


                                <div className="stat-card">

                                    <span>
                                        Ausentes
                                    </span>

                                    <strong>
                                        {totalAusentes}
                                    </strong>

                                </div>


                                <div className="stat-card">

                                    <span>
                                        Registradas
                                    </span>

                                    <strong>
                                        {totalRegistradas}
                                    </strong>

                                </div>


                                <div className="stat-card">

                                    <span>
                                        Porcentaje
                                    </span>

                                    <strong>
                                        {porcentajeAsistencia}%
                                    </strong>

                                </div>

                            </div>


                            <div className="classes-grid">

                                {clases.map(
                                    (
                                        clase,
                                    ) => (

                                        <div
                                            className="class-card"
                                            key={
                                                clase.id_clase
                                            }
                                        >

                                            <h3>
                                                {
                                                    clase.disciplina ??
                                                    "Clase"
                                                }
                                            </h3>

                                            <p>
                                                📅{" "}
                                                {
                                                    clase.fecha
                                                }
                                            </p>

                                            <p>
                                                🕐{" "}
                                                {
                                                    clase.hora_inicio
                                                }
                                                {" - "}
                                                {
                                                    clase.hora_fin
                                                }
                                            </p>


                                            <button
                                                className="primary-button"
                                                onClick={() => {

                                                    cambiarSeccion(
                                                        "clases",
                                                    );

                                                    cargarAlumnosClase(
                                                        clase.id_clase,
                                                    );

                                                }}
                                            >
                                                Registrar asistencia
                                            </button>

                                        </div>
                                    ),
                                )}

                            </div>

                        </div>

                    </section>
                )}


                {/* =================================================
                    REPORTES, AGENDA Y EXPORTACIÓN
                ================================================= */}
                {seccion === "reportes" && (
                    <section className="dashboard-section">
                        <div className="dashboard-card">
                            <div className="card-header">
                                <div>
                                    <span className="section-label">REPORTES</span>
                                    <h2>Reportes y agenda docente</h2>
                                    <p>Consultá tu carga de trabajo y exportá los datos que el sistema ya tiene registrados.</p>
                                </div>
                            </div>

                            <div className="stats-grid">
                                <div className="stat-card"><span>Grupos</span><strong>{grupos.length}</strong></div>
                                <div className="stat-card"><span>Clases cargadas</span><strong>{clases.length}</strong></div>
                                <div className="stat-card"><span>Alumnos únicos</span><strong>{totalAlumnos}</strong></div>
                                <div className="stat-card"><span>Asistencias registradas</span><strong>{totalRegistradas}</strong></div>
                            </div>

                            <h3 style={{marginTop:"28px"}}>Descargas</h3>
                            <div style={{display:"flex", gap:"12px", flexWrap:"wrap"}}>
                                <button type="button" className="primary-button" onClick={() => exportarCSV("mis_grupos_docente.csv", grupos.map((g) => ({
                                    id_grupo: g.id_grupo,
                                    disciplina: g.disciplina,
                                    nivel: g.nivel,
                                    cupo_max: g.cupo_max,
                                    horarios: (horariosGrupo[g.id_grupo] ?? g.horarios ?? []).map((h: any) => `${h.dia_semana} ${h.hora_inicio}-${h.hora_fin}`).join(" | "),
                                    alumnos: (alumnosPorGrupo[g.id_grupo] ?? []).length,
                                })))}>⬇️ Exportar grupos</button>
                                <button type="button" className="primary-button" onClick={() => exportarCSV("mis_clases_docente.csv", clases.map((c) => ({
                                    id_clase: c.id_clase,
                                    id_grupo: c.id_grupo,
                                    disciplina: c.disciplina ?? "",
                                    nivel: c.nivel ?? "",
                                    fecha: fechaLocal(c.fecha),
                                    hora_inicio: c.hora_inicio,
                                    hora_fin: c.hora_fin,
                                    estado: c.estado,
                                })))}>⬇️ Exportar clases</button>
                                <button type="button" className="primary-button" onClick={() => exportarCSV("mis_alumnos_docente.csv", grupos.flatMap((g) => (alumnosPorGrupo[g.id_grupo] ?? []).map((a) => ({
                                    id_grupo: g.id_grupo,
                                    disciplina: g.disciplina,
                                    nivel: g.nivel,
                                    id_alumno: a.id_alumno,
                                    nombre: a.nombre,
                                    apellido: a.apellido,
                                    dni: a.dni ?? "",
                                }))))}>⬇️ Exportar alumnos</button>
                                <button type="button" className="secondary-button" onClick={() => exportarCSV("resumen_asistencias_docente.csv", Object.entries(asistencias).map(([idAlumno, a]) => ({
                                    id_alumno: idAlumno,
                                    estado: a?.estado ?? "Sin registrar",
                                    observaciones: a?.observaciones ?? "",
                                    id_clase_seleccionada: claseSeleccionada ?? "",
                                })))}>⬇️ Exportar asistencias</button>
                            </div>

                            <h3 style={{marginTop:"30px"}}>Agenda de clases</h3>
                            <div className="dashboard-filters" style={{display:"flex", gap:"12px", flexWrap:"wrap", marginBottom:"16px"}}>
                                <label>
                                    Estado de agenda
                                    <select value={filtroAgenda} onChange={(e) => setFiltroAgenda(e.target.value as "todas" | "pendientes" | "finalizadas")}>
                                        <option value="todas">Todas las clases</option>
                                        <option value="pendientes">No finalizadas</option>
                                        <option value="finalizadas">Finalizadas</option>
                                    </select>
                                </label>
                                <label>
                                    Buscar alumno
                                    <input type="search" value={busquedaAlumnoReporte} onChange={(e) => setBusquedaAlumnoReporte(e.target.value)} placeholder="Nombre, apellido o DNI" />
                                </label>
                            </div>

                            <div className="table-responsive">
                                <table className="attendance-table">
                                    <thead><tr><th>Fecha</th><th>Horario</th><th>Grupo</th><th>Disciplina</th><th>Estado</th></tr></thead>
                                    <tbody>
                                        {clases.filter((c) => {
                                            const estado = String(c.estado ?? "").toLocaleLowerCase("es-AR");
                                            if (filtroAgenda === "finalizadas" && !estado.includes("final")) return false;
                                            if (filtroAgenda === "pendientes" && estado.includes("final")) return false;
                                            return true;
                                        }).slice().sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()).map((c) => (
                                            <tr key={c.id_clase}>
                                                <td>{fechaLocal(c.fecha)}</td>
                                                <td>{c.hora_inicio}–{c.hora_fin}</td>
                                                <td>#{c.id_grupo}</td>
                                                <td>{c.disciplina ?? grupos.find((g) => g.id_grupo === c.id_grupo)?.disciplina ?? "—"}</td>
                                                <td>{c.estado}</td>
                                            </tr>
                                        ))}
                                        {clases.length === 0 && <tr><td colSpan={5}>No hay clases cargadas para mostrar.</td></tr>}
                                    </tbody>
                                </table>
                            </div>

                            <h3 style={{marginTop:"30px"}}>Listado de alumnos por grupo</h3>
                            <div className="table-responsive">
                                <table className="attendance-table">
                                    <thead><tr><th>Alumno</th><th>DNI</th><th>Grupo</th><th>Disciplina</th><th>Nivel</th></tr></thead>
                                    <tbody>
                                        {grupos.flatMap((g) => (alumnosPorGrupo[g.id_grupo] ?? []).map((a) => ({ ...a, grupo: g })))
                                            .filter((registro) => `${registro.nombre} ${registro.apellido} ${registro.dni ?? ""}`.toLocaleLowerCase("es-AR").includes(busquedaAlumnoReporte.toLocaleLowerCase("es-AR")))
                                            .map((registro, indice) => (
                                                <tr key={`${registro.grupo.id_grupo}-${registro.id_alumno}-${indice}`}>
                                                    <td>{registro.nombre} {registro.apellido}</td>
                                                    <td>{registro.dni ?? "—"}</td>
                                                    <td>#{registro.grupo.id_grupo}</td>
                                                    <td>{registro.grupo.disciplina}</td>
                                                    <td>{registro.grupo.nivel}</td>
                                                </tr>
                                            ))}
                                        {grupos.every((g) => !(alumnosPorGrupo[g.id_grupo] ?? []).length) && (
                                            <tr><td colSpan={5}>Todavía no hay alumnos cargados en los grupos.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <p style={{marginTop:"14px", color:"#6b7280", fontSize:"13px"}}>
                                Las descargas se generan en tu navegador. El reporte de asistencias refleja la clase seleccionada en el panel de asistencia; no reemplaza un registro oficial guardado en el servidor.
                            </p>
                        </div>
                    </section>
                )}

                {/* =================================================
                    LIQUIDACIONES
                ================================================= */}

                {seccion ===
                    "liquidaciones" && (

                    <section className="dashboard-section">

                        <div className="dashboard-card">

                            <div className="card-header">

                                <div>

                                    <span className="section-label">
                                        LIQUIDACIONES
                                    </span>

                                    <h2>
                                        Mis liquidaciones
                                    </h2>

                                    <p>
Consultá el resumen de tu actividad docente y descargá grupos, clases y alumnos desde Reportes. La liquidación monetaria requiere que el backend exponga los importes y períodos confirmados.
                                    </p>

                                </div>

                            </div>


                            {loadingLiquidaciones ? (
                                <div className="empty-state"><p>Cargando liquidaciones...</p></div>
                            ) : errorLiquidaciones ? (
                                <div className="dashboard-warning">⚠️ {errorLiquidaciones}</div>
                            ) : liquidaciones.length === 0 ? (
                                <div className="empty-state">
                                    <div>💰</div>
                                    <strong>Sin liquidaciones registradas</strong>
                                    <span>Cuando se generen liquidaciones asociadas a tus reservas, aparecerán acá.</span>
                                </div>
                            ) : (
                                <>
                                    <div className="stats-grid" style={{marginBottom:"20px"}}>
                                        <div className="stat-card">
                                            <span>Total a favor (pendiente)</span>
                                            <strong>{liquidaciones.filter((l) => l.estado.toLocaleLowerCase("es-AR") === "pendiente").reduce((total, l) => total + Number(l.monto_profesor || 0), 0).toLocaleString("es-AR", {style:"currency", currency:"ARS"})}</strong>
                                        </div>
                                        <div className="stat-card">
                                            <span>Liquidaciones pagadas</span>
                                            <strong>{liquidaciones.filter((l) => l.estado.toLocaleLowerCase("es-AR") === "pagado").length}</strong>
                                        </div>
                                        <div className="stat-card">
                                            <span>Liquidaciones pendientes</span>
                                            <strong>{liquidaciones.filter((l) => l.estado.toLocaleLowerCase("es-AR") === "pendiente").length}</strong>
                                        </div>
                                    </div>
                                    <div style={{display:"flex", justifyContent:"flex-end", marginBottom:"12px"}}>
                                        <button type="button" className="secondary-button" onClick={() => exportarCSV("mis_liquidaciones.csv", liquidaciones.map((l) => ({
                                            id_liquidacion: l.id_liquidacion,
                                            id_reserva: l.id_reserva,
                                            monto_base: l.monto_base,
                                            porcentaje: l.porcentaje,
                                            monto_profesor: l.monto_profesor,
                                            monto_academia: l.monto_academia,
                                            fecha_generacion: fechaLocal(l.fecha_generacion),
                                            estado: l.estado,
                                        })))}>⬇️ Exportar liquidaciones</button>
                                    </div>
                                    <div className="table-responsive">
                                        <table className="attendance-table">
                                            <thead><tr><th>Fecha</th><th>Reserva</th><th>Base</th><th>Porcentaje</th><th>Tu importe</th><th>Academia</th><th>Estado</th></tr></thead>
                                            <tbody>
                                                {liquidaciones.map((l) => (
                                                    <tr key={l.id_liquidacion}>
                                                        <td>{fechaLocal(l.fecha_generacion)}</td>
                                                        <td>#{l.id_reserva}</td>
                                                        <td>{Number(l.monto_base).toLocaleString("es-AR", {style:"currency", currency:"ARS"})}</td>
                                                        <td>{Number(l.porcentaje)}%</td>
                                                        <td>{Number(l.monto_profesor).toLocaleString("es-AR", {style:"currency", currency:"ARS"})}</td>
                                                        <td>{Number(l.monto_academia).toLocaleString("es-AR", {style:"currency", currency:"ARS"})}</td>
                                                        <td>{l.estado}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}

                        </div>

                    </section>
                )}


                {/* =================================================
                    PERFIL
                ================================================= */}

                {seccion ===
                    "perfil" && (

                    <section className="dashboard-section">

                        <div className="dashboard-card">

                            <div className="card-header">

                                <div>

                                    <span className="section-label">
                                        PERFIL
                                    </span>

                                    <h2>
                                        Mi perfil
                                    </h2>

                                </div>

                            </div>


                            {errorProfesor ? (

                                <div className="dashboard-warning">
                                    ⚠️ {errorProfesor}
                                </div>

                            ) : (

                                <div className="profile-info">

                                    <div className="profile-row">

                                        <span>
                                            Nombre
                                        </span>

                                        <strong>
                                            {
                                                profesor?.nombre ??
                                                usuario?.nombre ??
                                                "-"
                                            }
                                        </strong>

                                    </div>


                                    <div className="profile-row">

                                        <span>
                                            Apellido
                                        </span>

                                        <strong>
                                            {
                                                profesor?.apellido ??
                                                usuario?.apellido ??
                                                "-"
                                            }
                                        </strong>

                                    </div>


                                    <div className="profile-row">

                                        <span>
                                            ID Profesor
                                        </span>

                                        <strong>
                                            {
                                                idProfesor ??
                                                "-"
                                            }
                                        </strong>

                                    </div>


                                    <div className="profile-row">

                                        <span>
                                            Usuario
                                        </span>

                                        <strong>
                                            {
                                                usuario?.username ??
                                                usuario?.email ??
                                                "-"
                                            }
                                        </strong>

                                    </div>


                                    <div className="profile-row">

                                        <span>
                                            Estado
                                        </span>

                                        <strong>
                                            Activo
                                        </strong>

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