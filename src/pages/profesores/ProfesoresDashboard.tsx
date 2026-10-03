import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

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



import "./ProfesoresDashboard.css";





// =====================================================

// COMPONENTE

// =====================================================



const ProfesorDashboard = () => {



    const navigate = useNavigate();





    // =====================================================

    // USUARIO

    // =====================================================



    const [usuario, setUsuario] = useState<any>(null);





    // =====================================================

    // PROFESOR

    // =====================================================



    const [profesor, setProfesor] =

        useState<any>(null);



    const [idProfesor, setIdProfesor] =

        useState<number | null>(null);



    const [loadingProfesor, setLoadingProfesor] =

        useState(true);



    const [errorProfesor, setErrorProfesor] =

        useState("");





    // =====================================================

    // SECCIÓN

    // =====================================================



    const [seccion, setSeccion] =

        useState<

            | "inicio"

            | "grupos"

            | "clases"

            | "alumnos"

            | "asistencias"

            | "liquidaciones"

            | "perfil"

        >("inicio");





    // =====================================================

    // GRUPOS

    // =====================================================



    const [grupos, setGrupos] =

        useState<Grupo[]>([]);



    const [loadingGrupos, setLoadingGrupos] =

        useState(false);



    const [errorGrupos, setErrorGrupos] =

        useState("");


    // =====================================================
    // CREAR GRUPO
    // =====================================================

    const [mostrarFormularioGrupo, setMostrarFormularioGrupo] =

        useState(false);

    const [creandoGrupo, setCreandoGrupo] =

        useState(false);

    const [nuevoGrupo, setNuevoGrupo] =

        useState({
            id_disciplina: 1,
            nivel: "Principiante",
            cupo_max: 20,
            dia_semana: "Lunes",
            hora_inicio: "18:00",
            hora_fin: "19:00",
        });





    // =====================================================

    // CLASES

    // =====================================================



    const [clases, setClases] =

        useState<Clase[]>([]);



    const [loadingClases, setLoadingClases] =

        useState(false);



    const [errorClases, setErrorClases] =

        useState("");





    // =====================================================

    // ALUMNOS

    // =====================================================



    const [alumnos, setAlumnos] =

        useState<AlumnoClase[]>([]);



    const [loadingAlumnos, setLoadingAlumnos] =

        useState(false);



    const [errorAlumnos, setErrorAlumnos] =

        useState("");





    // =====================================================

    // CLASE SELECCIONADA

    // =====================================================



    const [claseSeleccionada, setClaseSeleccionada] =

        useState<number | null>(null);





    // =====================================================

    // ASISTENCIAS

    // =====================================================



    /*

     * Guardamos las asistencias de esta forma:

     *

     * {

     *     1: asistencia,

     *     2: null,

     *     3: asistencia

     * }

     *

     * La clave es el ID del alumno.

     */



    const [asistencias, setAsistencias] =

        useState<

            Record<number, Asistencia | null>

        >({});





    const [loadingAsistencias, setLoadingAsistencias] =

        useState(false);





    const [guardandoAsistencia, setGuardandoAsistencia] =

        useState<number | null>(null);





    // =====================================================

    // MENSAJES

    // =====================================================



    const mostrarExito = async (

        titulo: string,

        texto: string

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

        texto: string

    ) => {



        await Swal.fire({

            icon: "error",

            title: titulo,

            text: texto,

            confirmButtonText: "Aceptar",

        });



    };





    // =====================================================

    // OBTENER ID USUARIO

    // =====================================================



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

                error

            );



            return null;

        }

    };





    // =====================================================

    // CERRAR SESIÓN

    // =====================================================



    const cerrarSesion = () => {



        localStorage.removeItem("usuario");

        localStorage.removeItem("token");



        navigate("/login");

    };





    // =====================================================

    // CARGAR PROFESOR

    // =====================================================



    const cargarProfesor = async () => {



        try {



            setLoadingProfesor(true);

            setErrorProfesor("");



            const idUsuario =

                obtenerIdUsuario();



            if (!idUsuario) {



                setErrorProfesor(

                    "No se pudo obtener el usuario."

                );



                return;

            }



            const datos =

                await obtenerProfesorPorUsuario(

                    idUsuario

                );



            console.log(

                "PROFESOR OBTENIDO:",

                datos

            );



            setProfesor(datos);



            const id =

                Number(

                    datos?.id_profesor ??

                    datos?.id_profesor ??

                    datos?.id_profesor

                );



            if (

                Number.isInteger(id) &&

                id > 0

            ) {



                setIdProfesor(id);



            } else {



                setErrorProfesor(

                    "No se pudo obtener el ID del profesor."

                );

            }



        } catch (error) {



            console.error(

                "Error obteniendo profesor:",

                error

            );



            setErrorProfesor(

                "No se pudo cargar la información del profesor."

            );



        } finally {



            setLoadingProfesor(false);

        }

    };





    // =====================================================

    // CARGAR GRUPOS

    // =====================================================



    const cargarGrupos = async () => {



        if (!idProfesor) return;



        try {



            setLoadingGrupos(true);

            setErrorGrupos("");



            const datos =

                await obtenerGruposProfesor(

                    idProfesor

                );



            console.log(

                "GRUPOS DEL PROFESOR:",

                datos

            );



            setGrupos(

                Array.isArray(datos)

                    ? datos

                    : []

            );



        } catch (error) {



            console.error(

                "Error obteniendo grupos:",

                error

            );



            setErrorGrupos(

                "No se pudieron cargar tus grupos."

            );



            setGrupos([]);



        } finally {



            setLoadingGrupos(false);

        }

    };





    // =====================================================

    // CARGAR CLASES

    // =====================================================



    const cargarClases = async () => {



        if (!idProfesor) return;



        try {



            setLoadingClases(true);

            setErrorClases("");



            const datos =

                await obtenerClasesProfesor(

                    idProfesor

                );



            console.log(

                "CLASES DEL PROFESOR:",

                datos

            );



            setClases(

                Array.isArray(datos)

                    ? datos

                    : []

            );



        } catch (error) {



            console.error(

                "Error obteniendo clases:",

                error

            );



            setErrorClases(

                "No se pudieron cargar tus clases."

            );



            setClases([]);



        } finally {



            setLoadingClases(false);

        }

    };





    // =====================================================

    // CARGAR ALUMNOS DE UNA CLASE

    // =====================================================



    const cargarAlumnosClase = async (

        idClase: number

    ) => {



        try {



            setLoadingAlumnos(true);

            setLoadingAsistencias(true);



            setErrorAlumnos("");



            setClaseSeleccionada(idClase);



            // ---------------------------------------------

            // ALUMNOS

            // ---------------------------------------------



            const data =

                await obtenerAlumnosPorClase(

                    idClase

                );



            const alumnosClase =

                Array.isArray(data)

                    ? data

                    : [];



            console.log(

                "ALUMNOS DE LA CLASE:",

                alumnosClase

            );



            setAlumnos(alumnosClase);





            // ---------------------------------------------

            // ASISTENCIAS

            // ---------------------------------------------



            const resultados =

                await Promise.all(



                    alumnosClase.map(

                        async (alumno) => {



                            /*

                             * Intentamos obtener el ID

                             * independientemente de si

                             * viene como id_alumno,

                             * idAlumno o id.

                             */



                            const idAlumno =

                                Number(

                                    alumno.id_alumno ??

                                    (alumno as any).idAlumno ??

                                    (alumno as any).id

                                );





                            console.log(

                                "ALUMNO:",

                                alumno

                            );



                            console.log(

                                "ID ALUMNO:",

                                idAlumno

                            );





                            // ---------------------------------

                            // VALIDAR ID

                            // ---------------------------------



                            if (

                                !Number.isInteger(idAlumno) ||

                                idAlumno <= 0

                            ) {



                                console.error(

                                    "ID DE ALUMNO INVÁLIDO:",

                                    alumno

                                );



                                return {

                                    idAlumno: 0,

                                    asistencia: null,

                                };

                            }





                            try {



                                const asistencia =

                                    await obtenerAsistenciaAlumnoClase(

                                        idAlumno,

                                        idClase

                                    );





                                console.log(

                                    "ASISTENCIA DEL ALUMNO EN LA CLASE:",

                                    asistencia

                                );





                                return {



                                    idAlumno,



                                    asistencia:

                                        Array.isArray(

                                            asistencia

                                        ) &&

                                        asistencia.length > 0



                                            ? asistencia[0]



                                            : null,

                                };





                            } catch (error) {



                                console.error(

                                    `Error obteniendo asistencia del alumno ${idAlumno}:`,

                                    error

                                );



                                return {

                                    idAlumno,

                                    asistencia: null,

                                };

                            }

                        }

                    )

                );





            // ---------------------------------------------

            // CREAR MAPA DE ASISTENCIAS

            // ---------------------------------------------



            const mapa:

                Record<

                    number,

                    Asistencia | null

                > = {};





            resultados.forEach(

                (resultado) => {



                    if (

                        resultado.idAlumno > 0

                    ) {



                        mapa[

                            resultado.idAlumno

                        ] =

                            resultado.asistencia;

                    }

                }

            );





            console.log(

                "MAPA DE ASISTENCIAS:",

                mapa

            );





            setAsistencias(mapa);





        } catch (error: any) {



            console.error(

                "Error obteniendo alumnos de clase:",

                error

            );



            setErrorAlumnos(

                "No se pudieron cargar los alumnos de esta clase."

            );



            await mostrarError(

                "Error",

                "No se pudieron cargar los alumnos de esta clase."

            );



        } finally {



            setLoadingAlumnos(false);

            setLoadingAsistencias(false);

        }

    };





    // =====================================================

    // REGISTRAR ASISTENCIA

    // =====================================================



    const guardarAsistencia = async (

        idAlumno: number,

        idClase: number,

        estado: string

    ) => {



        // ---------------------------------------------

        // VALIDAR ALUMNO

        // ---------------------------------------------



        if (

            !Number.isInteger(idAlumno) ||

            idAlumno <= 0

        ) {



            await mostrarError(

                "Error",

                "El ID del alumno no es válido."

            );



            return;

        }





        // ---------------------------------------------

        // VALIDAR CLASE

        // ---------------------------------------------



        if (

            !Number.isInteger(idClase) ||

            idClase <= 0

        ) {



            await mostrarError(

                "Error",

                "El ID de la clase no es válido."

            );



            return;

        }





        // ---------------------------------------------

        // SI YA EXISTE ASISTENCIA

        // NO HACEMOS POST

        // ---------------------------------------------



        const asistenciaExistente =

            asistencias[idAlumno];





        if (asistenciaExistente) {



            console.log(

                "La asistencia ya existe. No se registra nuevamente.",

                asistenciaExistente

            );



            return;

        }





        try {



            setGuardandoAsistencia(

                idAlumno

            );





            console.log(

                "REGISTRANDO ASISTENCIA:",

                {

                    idAlumno,

                    idClase,

                    estado,

                    observaciones: "",

                }

            );





            // -----------------------------------------

            // POST

            // -----------------------------------------



            await registrarAsistencia({



                id_alumno: idAlumno,



                id_clase: idClase,



                estado,



                observaciones: "",

            });





            // -----------------------------------------

            // ACTUALIZAR ESTADO LOCAL

            // -----------------------------------------



            setAsistencias(

                (anteriores) => ({



                    ...anteriores,



                    [idAlumno]: {



                        id_asistencia: 0,



                        id_alumno:

                            idAlumno,



                        id_clase:

                            idClase,



                        estado,



                        observaciones: "",

                    },

                })

            );





            await mostrarExito(

                "Asistencia registrada",

                `El alumno fue marcado como ${

                    estado === "presente"

                        ? "presente"

                        : "ausente"

                }.`

            );





        } catch (error: any) {



            console.error(

                "Error registrando asistencia:",

                error

            );





            const mensaje =

                error?.response?.data?.message ??

                "No se pudo registrar la asistencia.";





            await mostrarError(

                "Error",

                Array.isArray(mensaje)

                    ? mensaje.join(", ")

                    : mensaje

            );





        } finally {



            setGuardandoAsistencia(

                null

            );

        }

    };





    // =====================================================

    // CREAR GRUPO

    // =====================================================

    const cambiarDatoGrupo = (
        campo: string,
        valor: string | number
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
                "No se pudo obtener el ID del profesor."
            );
            return;
        }

        if (!nuevoGrupo.id_disciplina) {
            await mostrarError(
                "Error",
                "Seleccioná una disciplina."
            );
            return;
        }

        if (!nuevoGrupo.nivel.trim()) {
            await mostrarError(
                "Error",
                "Ingresá el nivel del grupo."
            );
            return;
        }

        if (!nuevoGrupo.cupo_max || nuevoGrupo.cupo_max <= 0) {
            await mostrarError(
                "Error",
                "El cupo máximo debe ser mayor a 0."
            );
            return;
        }

        if (!nuevoGrupo.dia_semana) {
            await mostrarError(
                "Error",
                "Seleccioná un día."
            );
            return;
        }

        if (!nuevoGrupo.hora_inicio || !nuevoGrupo.hora_fin) {
            await mostrarError(
                "Error",
                "Ingresá el horario completo."
            );
            return;
        }

        try {
            setCreandoGrupo(true);

            const datosGrupo = {
                id_disciplina: Number(nuevoGrupo.id_disciplina),
                nivel: nuevoGrupo.nivel,
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

            console.log("CREANDO GRUPO:", datosGrupo);

            const resultado = await crearGrupo(datosGrupo);

            console.log("GRUPO CREADO:", resultado);

            setMostrarFormularioGrupo(false);

            setNuevoGrupo({
                id_disciplina: 1,
                nivel: "Principiante",
                cupo_max: 20,
                dia_semana: "Lunes",
                hora_inicio: "18:00",
                hora_fin: "19:00",
            });

            await cargarGrupos();

            await mostrarExito(
                "Grupo creado",
                "El grupo fue creado correctamente."
            );

        } catch (error: any) {
            console.error("ERROR CREANDO GRUPO:", error);
            console.error(
                "RESPUESTA DEL BACKEND:",
                error?.response?.data
            );

            const mensaje =
                error?.response?.data?.message ??
                "No se pudo crear el grupo.";

            await mostrarError(
                "Error",
                Array.isArray(mensaje)
                    ? mensaje.join(", ")
                    : mensaje
            );

        } finally {
            setCreandoGrupo(false);
        }
    };



    // =====================================================
    // EFECTO INICIAL
    // =====================================================



    useEffect(() => {



        cargarProfesor();



    }, []);





    // =====================================================

    // CUANDO TENEMOS PROFESOR

    // =====================================================



    useEffect(() => {



        if (!idProfesor) return;



        cargarGrupos();

        cargarClases();



    }, [idProfesor]);





    // =====================================================

    // CAMBIAR SECCIÓN

    // =====================================================



    const cambiarSeccion = (

        nuevaSeccion:

            | "inicio"

            | "grupos"

            | "clases"

            | "alumnos"

            | "asistencias"

            | "liquidaciones"

            | "perfil"

    ) => {



        setSeccion(nuevaSeccion);



        // Cuando salimos de clases

        // limpiamos la clase seleccionada.



        if (

            nuevaSeccion !== "clases"

        ) {



            setClaseSeleccionada(

                null

            );



            setAlumnos([]);



            setAsistencias({});

        }

    };





    // =====================================================

    // LOADING PROFESOR

    // =====================================================



    if (loadingProfesor) {



        return (

            <div className="profesor-dashboard">



                <div className="loading">

                    Cargando dashboard...

                </div>



            </div>

        );

    }





    // =====================================================

    // RENDER

    // =====================================================



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

                            seccion === "inicio"

                                ? "active"

                                : ""

                        }

                        onClick={() =>

                            cambiarSeccion(

                                "inicio"

                            )

                        }

                    >

                        🏠 Inicio

                    </button>





                    <button

                        className={

                            seccion === "grupos"

                                ? "active"

                                : ""

                        }

                        onClick={() =>

                            cambiarSeccion(

                                "grupos"

                            )

                        }

                    >

                        👥 Mis grupos

                    </button>





                    <button

                        className={

                            seccion === "clases"

                                ? "active"

                                : ""

                        }

                        onClick={() =>

                            cambiarSeccion(

                                "clases"

                            )

                        }

                    >

                        📚 Mis clases

                    </button>





                    <button

                        className={

                            seccion === "alumnos"

                                ? "active"

                                : ""

                        }

                        onClick={() =>

                            cambiarSeccion(

                                "alumnos"

                            )

                        }

                    >

                        🎓 Mis alumnos

                    </button>





                    <button

                        className={

                            seccion === "asistencias"

                                ? "active"

                                : ""

                        }

                        onClick={() =>

                            cambiarSeccion(

                                "asistencias"

                            )

                        }

                    >

                        ✅ Asistencias

                    </button>





                    <button

                        className={

                            seccion === "liquidaciones"

                                ? "active"

                                : ""

                        }

                        onClick={() =>

                            cambiarSeccion(

                                "liquidaciones"

                            )

                        }

                    >

                        💰 Liquidaciones

                    </button>





                    <button

                        className={

                            seccion === "perfil"

                                ? "active"

                                : ""

                        }

                        onClick={() =>

                            cambiarSeccion(

                                "perfil"

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

                                ?.toUpperCase() ?? "P"}



                        </div>





                        <div>



                            <strong>

                                {profesor?.nombre}{" "}

                                {profesor?.apellido}

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



                {seccion === "inicio" && (



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

                                        Desde acá podés

                                        administrar tus

                                        grupos, clases,

                                        alumnos y asistencias.

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

                                        Profesor

                                    </span>



                                    <strong>

                                        #{idProfesor ?? "-"}

                                    </strong>



                                </div>



                            </div>



                        </div>



                    </section>

                )}







                {/* =================================================

                    GRUPOS

                ================================================= */}



                {seccion === "grupos" && (



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
                                        Grupos que tenés
                                        asignados.
                                    </p>

                                </div>

                                <button
                                    className="primary-button"
                                    onClick={() =>
                                        setMostrarFormularioGrupo(
                                            !mostrarFormularioGrupo
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
                                                Completá los datos del nuevo grupo.
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
                                                        Number(e.target.value)
                                                    )
                                                }
                                            >
                                                <option value={1}>Natación</option>
                                                <option value={2}>Yoga</option>
                                                <option value={3}>Pilates</option>
                                                <option value={4}>Funcional</option>
                                            </select>
                                        </div>

                                        <div className="profile-row">
                                            <span>Nivel</span>
                                            <select
                                                value={nuevoGrupo.nivel}
                                                onChange={(e) =>
                                                    cambiarDatoGrupo(
                                                        "nivel",
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option value="Principiante">Principiante</option>
                                                <option value="Intermedio">Intermedio</option>
                                                <option value="Avanzado">Avanzado</option>
                                            </select>
                                        </div>

                                        <div className="profile-row">
                                            <span>Cupo máximo</span>
                                            <input
                                                type="number"
                                                min="1"
                                                value={nuevoGrupo.cupo_max}
                                                onChange={(e) =>
                                                    cambiarDatoGrupo(
                                                        "cupo_max",
                                                        Number(e.target.value)
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
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option value="Lunes">Lunes</option>
                                                <option value="Martes">Martes</option>
                                                <option value="Miércoles">Miércoles</option>
                                                <option value="Jueves">Jueves</option>
                                                <option value="Viernes">Viernes</option>
                                                <option value="Sábado">Sábado</option>
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
                                                        e.target.value
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
                                                        e.target.value
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
                                                disabled={creandoGrupo}
                                            >
                                                {creandoGrupo
                                                    ? "Creando..."
                                                    : "Crear grupo"}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setMostrarFormularioGrupo(false)
                                                }
                                                disabled={creandoGrupo}
                                                style={{
                                                    padding: "10px 18px",
                                                    borderRadius: "8px",
                                                    border: "1px solid #ccc",
                                                    background: "white",
                                                    cursor: creandoGrupo
                                                        ? "not-allowed"
                                                        : "pointer",
                                                }}
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

                                        No hay grupos asignados

                                        actualmente.

                                    </span>



                                </div>



                            ) : (



                                <div className="groups-grid">



                                    {grupos.map(

                                        (grupo) => (



                                            <div

                                                className="group-card"

                                                key={

                                                    grupo.id_grupo

                                                }

                                            >



                                                <div className="group-card-header">



                                                    <span>

                                                        {grupo.disciplina}

                                                    </span>



                                                    <span>

                                                        {grupo.nivel}

                                                    </span>



                                                </div>





                                                <h3>

                                                    {grupo.disciplina}

                                                </h3>





                                                <p>

                                                    Nivel:{" "}

                                                    {grupo.nivel}

                                                </p>





                                                {grupo.horarios &&

                                                    grupo.horarios.length >

                                                        0 && (



                                                        <div className="group-schedule">



                                                            {grupo.horarios.map(

                                                                (

                                                                    horario

                                                                ) => (



                                                                    <div

                                                                        key={

                                                                            horario.id_horario

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

                                                                )

                                                            )}



                                                        </div>

                                                    )}



                                            </div>

                                        )

                                    )}



                                </div>

                            )}



                        </div>



                    </section>

                )}







                {/* =================================================

                    CLASES

                ================================================= */}



                {seccion === "clases" && (



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

                                        Seleccioná una clase

                                        para ver sus alumnos

                                        y registrar asistencia.

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

                                        No hay clases asignadas

                                        actualmente.

                                    </span>



                                </div>



                            ) : (



                                <div className="classes-grid">



                                    {clases.map(

                                        (clase) => (



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

                                                        clase.id_clase

                                                    )

                                                }

                                            >



                                                <div className="class-card-header">



                                                    <span>

                                                        Clase

                                                    </span>



                                                    <span>

                                                        #{clase.id_clase}

                                                    </span>



                                                </div>





                                                <h3>

                                                    {clase.disciplina ??

                                                        "Clase"}

                                                </h3>





                                                {clase.id_grupo && (



                                                    <p>

                                                        Grupo:{" "}

                                                        {

                                                            clase.id_grupo

                                                        }

                                                    </p>

                                                )}





                                                {clase.fecha && (



                                                    <p>

                                                        📅{" "}

                                                        {

                                                            clase.fecha

                                                        }

                                                    </p>

                                                )}





                                                <button

                                                    className="primary-button"

                                                    onClick={(

                                                        event

                                                    ) => {



                                                        event.stopPropagation();



                                                        cargarAlumnosClase(

                                                            clase.id_clase

                                                        );

                                                    }}

                                                >

                                                    Ver alumnos

                                                </button>



                                            </div>

                                        )

                                    )}



                                </div>

                            )}



                        </div>







                        {/* =================================================

                            ALUMNOS + ASISTENCIA

                        ================================================= */}



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



                                        <p>

                                            Registrá la asistencia

                                            de cada alumno.

                                        </p>



                                    </div>





                                    <button

                                        className="outline-button"

                                        onClick={() => {



                                            setClaseSeleccionada(

                                                null

                                            );



                                            setAlumnos([]);



                                            setAsistencias({});

                                        }}

                                    >

                                        Cerrar

                                    </button>



                                </div>







                                {/* -----------------------------------------

                                    LOADING

                                ----------------------------------------- */}



                                {loadingAlumnos ||

                                loadingAsistencias ? (



                                    <div className="loading">

                                        Cargando alumnos y

                                        asistencias...

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

                                            Esta clase todavía

                                            no tiene alumnos

                                            inscriptos.

                                        </span>



                                    </div>



                                ) : (



                                    <div className="attendance-list">



                                        {alumnos.map(

                                            (alumno) => {



                                                const idAlumno =

                                                    Number(

                                                        alumno.id_alumno ??

                                                        (alumno as any)

                                                            .idAlumno ??

                                                        (alumno as any)

                                                            .id

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



                                                        {/* AVATAR */}



                                                        <div className="student-avatar">



                                                            {alumno.nombre

                                                                ?.charAt(

                                                                    0

                                                                )

                                                                ?.toUpperCase()}



                                                        </div>





                                                        {/* DATOS */}



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



                                                        </div>





                                                        {/* ESTADO */}



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





                                                        {/* =================================================

                                                            ACCIONES

                                                            SOLO aparecen si NO hay asistencia

                                                        ================================================= */}



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

                                                                            "presente"

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

                                                                        guardando

                                                                    }

                                                                    onClick={() =>

                                                                        guardarAsistencia(

                                                                            idAlumno,

                                                                            claseSeleccionada,

                                                                            "ausente"

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

                                            }

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



                {seccion === "alumnos" && (



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

                                        Seleccioná una clase

                                        desde "Mis clases"

                                        para consultar sus

                                        alumnos.

                                    </p>



                                </div>



                            </div>





                            <div className="empty-state">



                                <div>

                                    🎓

                                </div>



                                <strong>

                                    Consultá los alumnos

                                    desde una clase

                                </strong>



                                <span>

                                    Entrá en "Mis clases"

                                    y seleccioná la clase

                                    que quieras consultar.

                                </span>





                                <button

                                    className="primary-button"

                                    onClick={() =>

                                        cambiarSeccion(

                                            "clases"

                                        )

                                    }

                                >

                                    Ver mis clases

                                </button>



                            </div>



                        </div>



                    </section>

                )}







                {/* =================================================

                    ASISTENCIAS

                ================================================= */}



                {seccion === "asistencias" && (



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

                                        Para registrar asistencia,

                                        seleccioná una clase

                                        desde "Mis clases".

                                    </p>



                                </div>



                            </div>





                            <div className="empty-state">



                                <div>

                                    ✅

                                </div>



                                <strong>

                                    Seleccioná una clase

                                </strong>



                                <span>

                                    Desde ahí vas a poder

                                    ver todos los alumnos

                                    y registrar su asistencia.

                                </span>





                                <button

                                    className="primary-button"

                                    onClick={() =>

                                        cambiarSeccion(

                                            "clases"

                                        )

                                    }

                                >

                                    Ir a mis clases

                                </button>



                            </div>



                        </div>



                    </section>

                )}







                {/* =================================================

                    LIQUIDACIONES

                ================================================= */}



                {seccion === "liquidaciones" && (



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

                                        Acá vas a poder consultar

                                        tus liquidaciones.

                                    </p>



                                </div>



                            </div>





                            <div className="empty-state">



                                <div>

                                    💰

                                </div>



                                <strong>

                                    Liquidaciones

                                </strong>



                                <span>

                                    Esta sección estará

                                    disponible próximamente.

                                </span>



                            </div>



                        </div>



                    </section>

                )}







                {/* =================================================

                    PERFIL

                ================================================= */}



                {seccion === "perfil" && (



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

                                                usuario.apellido ??

                                                "-"

                                            }

                                        </strong>



                                    </div>





                                    <div className="profile-row">



                                        <span>

                                            ID Profesor

                                        </span>



                                        <strong>

                                            {idProfesor ??

                                                "-"}

                                        </strong>



                                    </div>





                                    <div className="profile-row">



                                        <span>

                                            Usuario

                                        </span>



                                        <strong>

                                            {usuario?.username ??

                                                usuario?.email ??

                                                "-"}

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