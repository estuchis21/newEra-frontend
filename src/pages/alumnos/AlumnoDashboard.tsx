import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import Swal from "sweetalert2";



import {

  obtenerIdAlumnoPorUsuario,

} from "../../services/auth.service";



import "./AlumnoDashboard.css";
import { exportarCSV, fechaLocal, estadoNormalizado } from "../../utils/exportarCsv";
import { obtenerResumenCreditos, type ResumenCreditos } from "../../services/creditos.service";



import {

  inscribirseGrupo,

  eliminarInscripcion,

  obtenerGruposAlumno,

  obtenerGruposDisponibles,

  type Grupo,

} from "../../services/grupos.service";



import {

  obtenerAsistencias,

  type Asistencia,

} from "../../services/asistencia.service";



import {

  obtenerCuotasAlumno,

  crearPago,

  type Cuota,

} from "../../services/cuotas-pagos.service";



// =====================================================

// COMPONENTE

// =====================================================



export default function AlumnoDashboard() {



  const navigate = useNavigate();



  // =====================================================

  // USUARIO

  // =====================================================



  const usuarioGuardado = localStorage.getItem("usuario");



  const usuario = usuarioGuardado

    ? JSON.parse(usuarioGuardado)

    : null;



  // =====================================================

  // ALUMNO

  // =====================================================



  const [alumno, setAlumno] = useState<any>(null);



  const [idAlumno, setIdAlumno] = useState<number | null>(null);



  const [loadingAlumno, setLoadingAlumno] = useState(true);



  const [errorAlumno, setErrorAlumno] = useState("");



  // =====================================================

  // SECCIÓN

  // =====================================================



  const [seccion, setSeccion] = useState("inicio");

  const [filtroEstadoAsistencia, setFiltroEstadoAsistencia] = useState("todos");
  const [resumenCreditos, setResumenCreditos] = useState<ResumenCreditos>({ saldos: [], movimientos: [] });
  const [loadingCreditos, setLoadingCreditos] = useState(false);
  const [errorCreditos, setErrorCreditos] = useState("");
  const [busquedaGrupo, setBusquedaGrupo] = useState("");



  // =====================================================

  // GRUPOS

  // =====================================================



  const [grupos, setGrupos] = useState<Grupo[]>([]);



  const [gruposDisponibles, setGruposDisponibles] =

    useState<Grupo[]>([]);



  const [loadingGrupos, setLoadingGrupos] =

    useState(false);



  const [loadingGruposDisponibles, setLoadingGruposDisponibles] =

    useState(false);



  const [errorGrupos, setErrorGrupos] =

    useState("");



  const [errorGruposDisponibles, setErrorGruposDisponibles] =

    useState("");



  // =====================================================

  // INSCRIPCIÓN

  // =====================================================



  const [inscribiendo, setInscribiendo] =

    useState<number | null>(null);



  const [mensajeInscripcion, setMensajeInscripcion] =

    useState("");



  const [eliminandoInscripcion, setEliminandoInscripcion] =

    useState<number | null>(null);



  // =====================================================

  // ASISTENCIAS

  // =====================================================



  const [asistencias, setAsistencias] =

    useState<Asistencia[]>([]);



  const [loadingAsistencias, setLoadingAsistencias] =

    useState(false);



  const [errorAsistencias, setErrorAsistencias] =

    useState("");



  // =====================================================

  // CUOTAS

  // =====================================================



  const [cuotas, setCuotas] =

    useState<Cuota[]>([]);



  const [loadingCuotas, setLoadingCuotas] =

    useState(false);



  const [errorCuotas, setErrorCuotas] =

    useState("");



  const [pagandoCuota, setPagandoCuota] =

    useState<number | null>(null);



  // =====================================================

  // OBTENER ID DEL ALUMNO

  // =====================================================



  // =====================================================
  // CARGAR RESUMEN DE CRÉDITOS
  // =====================================================
  useEffect(() => {
    if (!idAlumno) return;
    let cancelado = false;

    const cargarCreditos = async () => {
      try {
        setLoadingCreditos(true);
        setErrorCreditos("");
        const resumen = await obtenerResumenCreditos(idAlumno);
        if (!cancelado) setResumenCreditos(resumen);
      } catch (error) {
        console.error("Error cargando créditos:", error);
        if (!cancelado) {
          setErrorCreditos("No se pudo cargar el saldo de créditos.");
          setResumenCreditos({ saldos: [], movimientos: [] });
        }
      } finally {
        if (!cancelado) setLoadingCreditos(false);
      }
    };

    void cargarCreditos();
    return () => { cancelado = true; };
  }, [idAlumno]);

  useEffect(() => {



    const cargarAlumno = async () => {



      try {



        setLoadingAlumno(true);



        setErrorAlumno("");



        if (!usuario) {



          setErrorAlumno(

            "No se encontró información del usuario."

          );



          return;

        }



        const idUsuario =

          usuario.id_usuario ??

          usuario.idUsuario ??

          usuario.id;



        if (!idUsuario) {



          setErrorAlumno(

            "No se pudo obtener el ID del usuario."

          );



          return;

        }



        const respuesta =

          await obtenerIdAlumnoPorUsuario(idUsuario);



        console.log(

          "RESPUESTA DE NESTJS:",

          respuesta

        );



        const id =

          typeof respuesta === "number"

            ? respuesta

            : undefined;



        if (!id) {



          setErrorAlumno(

            "No se pudo obtener el ID del alumno."

          );



          return;

        }



        console.log(

          "================================="

        );



        console.log(

          "ID ALUMNO OBTENIDO:",

          id

        );



        console.log(

          "================================="

        );



        setIdAlumno(Number(id));



        setAlumno(usuario);



      } catch (error) {



        console.error(

          "Error obteniendo alumno:",

          error

        );



        setErrorAlumno(

          "No se pudo obtener la información del alumno."

        );



      } finally {



        setLoadingAlumno(false);



      }



    };



    cargarAlumno();



  }, []);



  // =====================================================

  // CARGAR GRUPOS DEL ALUMNO

  // =====================================================



  const cargarGrupos = async () => {



    if (!idAlumno) return;



    try {



      setLoadingGrupos(true);



      setErrorGrupos("");



      const datos =

        await obtenerGruposAlumno(idAlumno);



      console.log(

        "GRUPOS DEL ALUMNO:",

        datos

      );



      setGrupos(datos || []);



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

  // CARGAR GRUPOS DISPONIBLES

  // =====================================================



  const cargarGruposDisponibles = async () => {



    try {



      setLoadingGruposDisponibles(true);

      setErrorGruposDisponibles("");



      const datos =

        await obtenerGruposDisponibles();



      const grupos =

        Array.isArray(datos)

          ? datos

          : [];



      console.log(

        "GRUPOS DISPONIBLES:",

        grupos

      );



      setGruposDisponibles(

        grupos.filter(

          (grupo) =>

            grupo.activo !== false

        )

      );



    } catch (error: any) {



      console.error(

        "Error obteniendo grupos disponibles:",

        error

      );



      const mensaje =

        error?.response?.data?.message ??

        error?.response?.data?.error ??

        "No se pudieron cargar los grupos disponibles.";



      setErrorGruposDisponibles(

        mensaje

      );



      setGruposDisponibles([]);



    } finally {



      setLoadingGruposDisponibles(false);



    }



  };



  // =====================================================

  // CARGAR ASISTENCIAS

  // =====================================================



  const cargarAsistencias = async () => {



    if (!idAlumno) return;



    try {



      setLoadingAsistencias(true);



      setErrorAsistencias("");



      const datos =

        await obtenerAsistencias(idAlumno);



      console.log(

        "ASISTENCIAS RECIBIDAS POR DASHBOARD:",

        datos

      );



      if (Array.isArray(datos)) {



        setAsistencias(datos);



      } else {



        console.error(

          "Las asistencias no son un array:",

          datos

        );



        setAsistencias([]);



      }



    } catch (error) {



      console.error(

        "Error obteniendo asistencias:",

        error

      );



      setErrorAsistencias(

        "No se pudieron cargar tus asistencias."

      );



      setAsistencias([]);



    } finally {



      setLoadingAsistencias(false);



    }



  };



  // =====================================================

  // CARGAR CUOTAS DEL ALUMNO

  // =====================================================



  const cargarCuotas = async () => {

    if (!idAlumno) return;



    try {

      setLoadingCuotas(true);

      setErrorCuotas("");



      const datos = await obtenerCuotasAlumno(idAlumno);



      console.log(

        "CUOTAS DEL ALUMNO:",

        datos

      );



      setCuotas(Array.isArray(datos) ? datos : []);

    } catch (error: any) {

      console.error(

        "Error obteniendo cuotas:",

        error

      );



      const mensaje =

        error?.response?.data?.message ??

        error?.response?.data?.error ??

        "No se pudieron cargar las cuotas.";



      setErrorCuotas(mensaje);

      setCuotas([]);

    } finally {

      setLoadingCuotas(false);

    }

  };



  // =====================================================

  // PAGAR CUOTA

  // =====================================================



  const handlePagarCuota = async (idCuota: number) => {

    try {

      setPagandoCuota(idCuota);



      const resultado = await crearPago(idCuota);



      console.log(

        "RESPUESTA CREAR PAGO:",

        resultado

      );



      const url =

        resultado?.init_point ??

        resultado?.sandbox_init_point ??

        resultado?.url;



      if (url) {

        window.location.href = url;

        return;

      }



      await Swal.fire({

        icon: "success",

        title: "Pago creado",

        text: "Se creó correctamente el pago.",

        confirmButtonText: "Aceptar",

      });



      await cargarCuotas();

    } catch (error: any) {

      console.error(

        "Error creando pago:",

        error

      );



      const mensaje =

        error?.response?.data?.message ??

        error?.response?.data?.error ??

        "No se pudo iniciar el pago.";



      await Swal.fire({

        icon: "error",

        title: "Error",

        text: mensaje,

        confirmButtonText: "Aceptar",

      });

    } finally {

      setPagandoCuota(null);

    }

  };



  // =====================================================

  // CUANDO TENEMOS EL ID DEL ALUMNO

  // =====================================================



  useEffect(() => {



    if (!idAlumno) return;



    cargarGrupos();



    cargarAsistencias();



    cargarCuotas();



  }, [idAlumno]);



  // =====================================================

  // CUANDO ENTRA EN INSCRIBIRME

  // =====================================================



  useEffect(() => {



    if (seccion === "inscribirme") {



      cargarGruposDisponibles();



    }



  }, [seccion]);



  // =====================================================

  // INSCRIBIRSE A UN GRUPO

  // =====================================================



  const handleInscribirse = async (

    idGrupo: number

  ) => {



    if (!idAlumno) {



      await Swal.fire({

        icon: "error",

        title: "Error",

        text: "No se pudo identificar al alumno.",

      });



      return;

    }



    try {



      setInscribiendo(idGrupo);



      setMensajeInscripcion("");



      await inscribirseGrupo(

        idAlumno,

        idGrupo

      );



      setMensajeInscripcion(

        "¡Te inscribiste correctamente al grupo!"

      );



      await Swal.fire({

        icon: "success",

        title: "¡Inscripción exitosa!",

        text: "Te inscribiste correctamente al grupo.",

        confirmButtonText: "Aceptar",

      });



      await cargarGrupos();



      await cargarGruposDisponibles();



    } catch (error: any) {



      console.error(

        "Error inscribiendo:",

        error

      );



      const mensaje =

        error?.response?.data?.message ??

        error?.response?.data?.error ??

        "No se pudo realizar la inscripción.";



      setMensajeInscripcion(

        mensaje

      );



      await Swal.fire({

        icon: "error",

        title: "No se pudo inscribir",

        text: mensaje,

        confirmButtonText: "Aceptar",

      });



    } finally {



      setInscribiendo(null);



    }



  };



  // =====================================================

  // ELIMINAR INSCRIPCIÓN

  // =====================================================



  const handleEliminarInscripcion = async (

    idInscripcion: number

  ) => {



    try {



      const resultado =

        await Swal.fire({



          icon: "warning",



          title: "¿Cancelar inscripción?",



          text:

            "Se eliminará tu inscripción y se devolverá el crédito utilizado.",



          showCancelButton: true,



          confirmButtonText:

            "Sí, cancelar",



          cancelButtonText:

            "No",



          confirmButtonColor:

            "#d33",



        });



      if (!resultado.isConfirmed) {

        return;

      }



      setEliminandoInscripcion(

        idInscripcion

      );



      await eliminarInscripcion(

        idInscripcion

      );



      await Swal.fire({



        icon: "success",



        title: "Inscripción cancelada",



        text:

          "La inscripción fue eliminada y se devolvió el crédito.",



        confirmButtonText:

          "Aceptar",



      });



      await cargarGrupos();



      await cargarGruposDisponibles();



    } catch (error: any) {



      console.error(

        "Error eliminando inscripción:",

        error

      );



      const mensaje =

        error?.response?.data?.message ??

        error?.response?.data?.error ??

        "No se pudo eliminar la inscripción.";



      await Swal.fire({



        icon: "error",



        title: "Error",



        text: mensaje,



        confirmButtonText:

          "Aceptar",



      });



    } finally {



      setEliminandoInscripcion(

        null

      );



    }



  };



  // =====================================================

  // CERRAR SESIÓN

  // =====================================================



  const cerrarSesion = () => {



    localStorage.removeItem("usuario");



    navigate("/login");



  };



  // =====================================================

  // LOADING ALUMNO

  // =====================================================



  if (loadingAlumno) {



    return (

      <div className="dashboard-loading">



        <div className="loading-spinner"></div>



        <p>

          Cargando información del alumno...

        </p>



      </div>

    );



  }



  // =====================================================

  // ERROR ALUMNO

  // =====================================================



  if (errorAlumno) {



    return (

      <div className="dashboard-error">



        <h2>

          Error

        </h2>



        <p>

          {errorAlumno}

        </p>



        <button

          onClick={cerrarSesion}

        >

          Volver al inicio de sesión

        </button>



      </div>

    );



  }



  // =====================================================

  // NOMBRE

  // =====================================================



  const nombreAlumno =

    alumno?.nombre ??

    usuario?.nombre ??

    "Alumno";



  const apellidoAlumno =

    alumno?.apellido ??

    usuario?.apellido ??

    "";



  const nombreCompleto =

    `${nombreAlumno} ${apellidoAlumno}`.trim();



  // =====================================================

  // RENDER

  // =====================================================



  return (



    <div className="alumno-dashboard">



      {/* =================================================

          SIDEBAR

      ================================================= */}



      <aside className="sidebar">



        <div className="sidebar-logo">



          <div className="logo-icon">

            NE

          </div>



          <div>



            <h2>

              New Era

            </h2>



            <span>

              Academy

            </span>



          </div>



        </div>



        <div className="sidebar-user">



          <div className="user-avatar">



            {nombreAlumno

              ?.charAt(0)

              ?.toUpperCase()}



          </div>



          <div>



            <strong>

              {nombreCompleto}

            </strong>



            <span>

              Alumno

            </span>



          </div>



        </div>



        <nav className="sidebar-nav">



          <button

            className={

              seccion === "inicio"

                ? "active"

                : ""

            }

            onClick={() =>

              setSeccion("inicio")

            }

          >

            🏠

            <span>

              Inicio

            </span>

          </button>



          <button

            className={

              seccion === "grupos"

                ? "active"

                : ""

            }

            onClick={() =>

              setSeccion("grupos")

            }

          >

            👥

            <span>

              Mis grupos

            </span>

          </button>



          <button

            className={

              seccion === "asistencia"

                ? "active"

                : ""

            }

            onClick={() =>

              setSeccion("asistencia")

            }

          >

            📋

            <span>

              Asistencia

            </span>

          </button>



          <button

            className={

              seccion === "inscribirme"

                ? "active"

                : ""

            }

            onClick={() =>

              setSeccion("inscribirme")

            }

          >

            ➕

            <span>

              Inscribirme

            </span>

          </button>



          <button

            className={

              seccion === "cuotas"

                ? "active"

                : ""

            }

            onClick={() =>

              setSeccion("cuotas")

            }

          >

            💳

            <span>

              Cuotas

            </span>

          </button>



          <button
            className={seccion === "creditos" ? "active" : ""}
            onClick={() => setSeccion("creditos")}
            type="button"
          >
            🎟️
            <span>Mis créditos</span>
          </button>

          <button
            className={seccion === "calendario" ? "active" : ""}
            onClick={() => setSeccion("calendario")}
            type="button"
          >
            🗓️
            <span>Mi calendario</span>
          </button>

          <button
            className={seccion === "reportes" ? "active" : ""}
            onClick={() => setSeccion("reportes")}
            type="button"
          >
            📊
            <span>Mis reportes</span>
          </button>

          <button

            className={

              seccion === "perfil"

                ? "active"

                : ""

            }

            onClick={() =>

              setSeccion("perfil")

            }

          >

            👤

            <span>

              Mi perfil

            </span>

          </button>



        </nav>



        <button

          className="logout-button"

          onClick={cerrarSesion}

        >

          🚪

          <span>

            Cerrar sesión

          </span>

        </button>



      </aside>



      {/* =================================================

          CONTENIDO

      ================================================= */}



      <main className="dashboard-main">



        {/* =================================================

            HEADER

        ================================================= */}



        <header className="dashboard-header">



          <div>



            <h1>



              {seccion === "inicio" &&

                "¡Bienvenido de nuevo!"}



              {seccion === "grupos" &&

                "Mis grupos"}

              {seccion === "calendario" && "Mi calendario"}

              {seccion === "creditos" && "Mis créditos"}

              {seccion === "reportes" && "Mis reportes"}



              {seccion === "asistencia" &&

                "Mi asistencia"}



              {seccion === "inscribirme" &&

                "Inscribirme"}



              {seccion === "cuotas" &&

                "Mis cuotas"}



              {seccion === "perfil" &&

                "Mi perfil"}



            </h1>



            <p>



              {seccion === "inicio"

                ? "Este es tu resumen académico."

                : "Gestioná tu información desde aquí."}



            </p>



          </div>



          <div className="header-user">



            <div className="header-avatar">



              {nombreAlumno

                ?.charAt(0)

                ?.toUpperCase()}



            </div>



          </div>



        </header>



        {/* =================================================

            INICIO

        ================================================= */}



        {seccion === "inicio" && (



          <section className="dashboard-section">



            <div className="welcome-card">



              <div>



                <span>

                  ¡Hola!

                </span>



                <h2>

                  {nombreCompleto}

                </h2>



                <p>

                  Seguí disfrutando de tus clases

                  y alcanzá tus objetivos.

                </p>



              </div>



            </div>



            <div className="stats-grid">



              <div className="stat-card">



                <div className="stat-icon">

                  👥

                </div>



                <div>



                  <span>

                    Mis grupos

                  </span>



                  <strong>

                    {grupos.length}

                  </strong>



                </div>



              </div>



              <div className="stat-card">



                <div className="stat-icon">

                  📋

                </div>



                <div>



                  <span>

                    Asistencias

                  </span>



                  <strong>

                    {asistencias.length}

                  </strong>



                </div>



              </div>



              <div className="stat-card">



                <div className="stat-icon">

                  💳

                </div>



                <div>



                  <span>

                    Cuota

                  </span>



                  <strong>

                    Al día

                  </strong>



                </div>



              </div>



            </div>



            <div className="dashboard-card">



              <div className="card-header">



                <div>



                  <h3>

                    Información del alumno

                  </h3>



                  <p>

                    Tus datos registrados

                  </p>



                </div>



              </div>



              <div className="student-info-grid">



                <div>



                  <span>

                    Nombre

                  </span>



                  <strong>

                    {nombreAlumno}

                  </strong>



                </div>



                <div>



                  <span>

                    Apellido

                  </span>



                  <strong>

                    {apellidoAlumno}

                  </strong>



                </div>



                <div>



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



            </div>



          </section>



        )}



        {/* =================================================

            MIS GRUPOS

        ================================================= */}



        {seccion === "grupos" && (



          <section className="dashboard-section">



            <div className="dashboard-card">



              <div className="card-header">



                <div>



                  <h3>

                    Mis grupos

                  </h3>



                  <p>

                    Grupos en los que estás inscripto

                  </p>



                </div>



              </div>



              {loadingGrupos ? (



                <div className="empty-state">



                  <p>

                    Cargando grupos...

                  </p>



                </div>



              ) : errorGrupos ? (



                <div className="dashboard-warning">



                  ⚠️ {errorGrupos}



                </div>



              ) : grupos.length === 0 ? (



                <div className="empty-state">



                  <div className="empty-icon">

                    👥

                  </div>



                  <h3>

                    No tenés grupos

                  </h3>



                  <p>

                    Todavía no estás inscripto

                    en ningún grupo.

                  </p>



                  <button

                    className="primary-button"

                    onClick={() =>

                      setSeccion("inscribirme")

                    }

                  >

                    Ver grupos disponibles

                  </button>



                </div>



              ) : (



                <div className="groups-grid">



                  {grupos.map((grupo) => (



                    <div

                      className="group-card"

                      key={grupo.id_grupo}

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

                        Nivel: {grupo.nivel}

                      </p>



                      {grupo.profesor && (



                        <p>

                          👨‍🏫 Profesor:{" "}

                          {grupo.profesor}

                        </p>



                      )}



                      {grupo.horarios &&

                        grupo.horarios.length > 0 && (



                          <div className="group-schedule">



                            {grupo.horarios.map(

                              (horario) => (



                                <div

                                  key={

                                    horario.id_horario

                                  }

                                >



                                  📅{" "}

                                  {horario.dia_semana}



                                  <br />



                                  🕐{" "}

                                  {horario.hora_inicio}

                                  {" - "}

                                  {horario.hora_fin}



                                </div>



                              )

                            )}



                          </div>



                        )}



                      {/* =====================================

                          CANCELAR INSCRIPCIÓN

                      ===================================== */}



                      {grupo.id_inscripcion && (



                        <button

                          type="button"

                          className="secondary-button"

                          disabled={

                            eliminandoInscripcion ===

                            grupo.id_inscripcion

                          }

                          onClick={() =>

                            handleEliminarInscripcion(

                              grupo.id_inscripcion!

                            )

                          }

                        >



                          {eliminandoInscripcion ===

                          grupo.id_inscripcion

                            ? "Cancelando..."

                            : "Cancelar inscripción"}



                        </button>



                      )}



                    </div>



                  ))}



                </div>



              )}



            </div>



          </section>



        )}



        {/* =================================================

            ASISTENCIA

        ================================================= */}



        {seccion === "asistencia" && (



          <section className="dashboard-section">



            <div className="dashboard-card">



              <div className="card-header">



                <div>



                  <h3>

                    Historial de asistencia

                  </h3>



                  <p>

                    Consultá tus asistencias

                  </p>

                  <div className="dashboard-filters" style={{display:"flex", gap:"12px", flexWrap:"wrap", marginTop:"12px"}}>
                    <label>
                      Estado de asistencia
                      <select value={filtroEstadoAsistencia} onChange={(e) => setFiltroEstadoAsistencia(e.target.value)}>
                        <option value="todos">Todos</option>
                        <option value="presente">Presentes</option>
                        <option value="ausente">Ausentes</option>
                        <option value="tarde">Llegadas tarde</option>
                      </select>
                    </label>
                    <button type="button" className="secondary-button" onClick={() => exportarCSV("mis_asistencias.csv", asistencias.map((a) => ({
                      fecha: fechaLocal(a.fecha), disciplina: a.disciplina ?? "", grupo: a.grupo ?? "",
                      estado: a.estado, observaciones: a.observaciones ?? "",
                    })))}>Exportar CSV</button>
                  </div>



                </div>



              </div>



              {loadingAsistencias ? (



                <div className="empty-state">



                  <p>

                    Cargando asistencias...

                  </p>



                </div>



              ) : errorAsistencias ? (



                <div className="dashboard-warning">



                  ⚠️ {errorAsistencias}



                </div>



              ) : asistencias.length === 0 ? (



                <div className="empty-state">



                  <div className="empty-icon">

                    📋

                  </div>



                  <h3>

                    No hay asistencias

                  </h3>



                  <p>

                    Todavía no tenés asistencias registradas.

                  </p>



                </div>



              ) : (



                <div className="attendance-table-wrapper">



                  <table className="attendance-table">



                    <thead>



                      <tr>



                        <th>

                          Fecha

                        </th>



                        <th>

                          Grupo

                        </th>



                        <th>

                          Disciplina

                        </th>



                        <th>

                          Estado

                        </th>



                      </tr>



                    </thead>



                    <tbody>



                      {asistencias.filter((asistencia) => {
                        if (filtroEstadoAsistencia === "todos") return true;
                        return estadoNormalizado(asistencia.estado).includes(filtroEstadoAsistencia);
                      }).map(

                        (asistencia) => (



                          <tr

                            key={

                              asistencia.id_asistencia

                            }

                          >



                            <td>



                              {asistencia.fecha

                                ? new Date(

                                    asistencia.fecha

                                  ).toLocaleDateString(

                                    "es-AR"

                                  )

                                : "-"}



                            </td>



                            <td>

                              {asistencia.grupo ??

                                "-"}

                            </td>



                            <td>

                              {asistencia.disciplina ??

                                "-"}

                            </td>



                            <td>



                              <span

                                className={

                                  asistencia.estado

                                    ?.toLowerCase() ===

                                  "presente"

                                    ? "status-present"

                                    : "status-absent"

                                }

                              >

                                {asistencia.estado}

                              </span>



                            </td>



                          </tr>



                        )

                      )}



                    </tbody>



                  </table>



                </div>



              )}



            </div>



          </section>



        )}



        {/* =================================================

            INSCRIBIRME

        ================================================= */}



        {seccion === "inscribirme" && (



          <section className="dashboard-section">



            {mensajeInscripcion && (



              <div className="dashboard-success">



                ✅ {mensajeInscripcion}



              </div>



            )}



            <div className="dashboard-card">



              <div className="card-header">



                <div>



                  <h3>

                    Grupos disponibles

                  </h3>



                  <p>

                    Elegí el grupo al que querés

                    inscribirte.

                  </p>
                  <label className="dashboard-search">
                    Buscar por disciplina, nivel o profesor
                    <input
                      type="search"
                      value={busquedaGrupo}
                      onChange={(e) => setBusquedaGrupo(e.target.value)}
                      placeholder="Ej.: inglés, inicial..."
                    />
                  </label>



                </div>



              </div>



              {loadingGruposDisponibles ? (



                <div className="empty-state">



                  <p>

                    Cargando grupos disponibles...

                  </p>



                </div>



              ) : errorGruposDisponibles ? (



                <div className="dashboard-warning">



                  ⚠️ {errorGruposDisponibles}



                </div>



              ) : gruposDisponibles.length === 0 ? (



                <div className="empty-state">



                  <div className="empty-icon">

                    📚

                  </div>



                  <h3>

                    No hay grupos disponibles

                  </h3>



                  <p>

                    En este momento no hay grupos

                    disponibles para inscribirse.

                  </p>



                </div>



              ) : (



                <div className="groups-grid">



                  {gruposDisponibles.filter((grupo) =>
                    `${grupo.disciplina} ${grupo.nivel} ${grupo.profesor ?? ""}`
                      .toLocaleLowerCase("es-AR")
                      .includes(busquedaGrupo.toLocaleLowerCase("es-AR"))
                  ).map(

                    (grupo) => (



                      <div

                        className="group-card"

                        key={grupo.id_grupo}

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

                          Nivel: {grupo.nivel}

                        </p>



                        {grupo.profesor && (



                          <p>

                            👨‍🏫 Profesor:{" "}

                            {grupo.profesor}

                          </p>



                        )}



                        {grupo.horarios &&

                          grupo.horarios.length > 0 && (



                            <div className="group-schedule">



                              {grupo.horarios.map(

                                (horario) => (



                                  <div

                                    key={

                                      horario.id_horario

                                    }

                                  >



                                    📅{" "}

                                    {horario.dia_semana}



                                    <br />



                                    🕐{" "}

                                    {horario.hora_inicio}

                                    {" - "}

                                    {horario.hora_fin}



                                  </div>



                                )

                              )}



                            </div>



                          )}



                        <button

                          className="primary-button"

                          disabled={

                            inscribiendo ===

                            grupo.id_grupo

                          }

                          onClick={() =>

                            handleInscribirse(

                              grupo.id_grupo

                            )

                          }

                        >



                          {inscribiendo ===

                          grupo.id_grupo

                            ? "Inscribiendo..."

                            : "Inscribirme"}



                        </button>



                      </div>



                    )

                  )}



                </div>



              )}



            </div>



          </section>



        )}



        {/* =================================================

            CUOTAS

        ================================================= */}



        {/* =================================================

            CUOTAS

        ================================================= */}

        {seccion === "cuotas" && (

          <section className="dashboard-section">

            <div className="dashboard-card">

              <div className="card-header">

                <div>

                  <h3>
                    Mis cuotas
                  </h3>

                  <p>
                    Consultá tus cuotas mensuales y realizá tus pagos.
                  </p>

                </div>

              </div>

              {loadingCuotas ? (

                <div className="empty-state">

                  <p>
                    Cargando cuotas...
                  </p>

                </div>

              ) : errorCuotas ? (

                <div className="dashboard-warning">

                  ⚠️ {errorCuotas}

                </div>

              ) : cuotas.length === 0 ? (

                <div className="empty-state">

                  <div className="empty-icon">
                    💳
                  </div>

                  <h3>
                    No tenés cuotas registradas
                  </h3>

                  <p>
                    Todavía no hay cuotas asociadas a tu cuenta.
                  </p>

                </div>

              ) : (

                <div className="payment-history">

                  <h3>
                    Historial mensual
                  </h3>

                  {cuotas
                    .slice()
                    .sort((a, b) => {

                      const fechaA = new Date(
                        (a as any).fecha_vencimiento ??
                        (a as any).fecha_pago ??
                        0
                      ).getTime();

                      const fechaB = new Date(
                        (b as any).fecha_vencimiento ??
                        (b as any).fecha_pago ??
                        0
                      ).getTime();

                      return fechaB - fechaA;

                    })
                    .map((cuota) => {

                      const cuotaData = cuota as any;

                      const idCuota = Number(
                        cuotaData.id_cuota
                      );

                      const estado = String(
                        cuotaData.estado ?? ""
                      ).toLowerCase();

                      const pagada =
                        estado === "pagado" ||
                        estado === "paga" ||
                        estado === "paid" ||
                        Boolean(cuotaData.fecha_pago);

                      const mes = Number(
                        cuotaData.mes
                      );

                      const anio = Number(
                        cuotaData.anio
                      );

                      let nombreMes =
                        "Cuota mensual";

                      if (
                        Number.isInteger(mes) &&
                        mes >= 1 &&
                        mes <= 12
                      ) {

                        const fechaMes = new Date(
                          anio ||
                            new Date().getFullYear(),
                          mes - 1,
                          1
                        );

                        nombreMes =
                          fechaMes.toLocaleDateString(
                            "es-AR",
                            {
                              month: "long",
                              year: "numeric",
                            }
                          );

                      } else {

                        const fechaReferencia =
                          cuotaData.fecha_vencimiento ??
                          cuotaData.fecha_pago;

                        if (fechaReferencia) {

                          const fecha =
                            new Date(
                              fechaReferencia
                            );

                          if (
                            !Number.isNaN(
                              fecha.getTime()
                            )
                          ) {

                            nombreMes =
                              fecha.toLocaleDateString(
                                "es-AR",
                                {
                                  month: "long",
                                  year: "numeric",
                                }
                              );

                          }

                        }

                      }

                      const monto =
                        cuotaData.monto ??
                        cuotaData.precio ??
                        cuotaData.paquete?.precio;

                      const montoFormateado =
                        monto !== undefined &&
                        monto !== null &&
                        monto !== ""
                          ? Number(monto).toLocaleString(
                              "es-AR",
                              {
                                style: "currency",
                                currency: "ARS",
                              }
                            )
                          : "-";

                      let vencimiento = "";

                      if (
                        cuotaData.fecha_vencimiento
                      ) {

                        const fechaVencimiento =
                          new Date(
                            cuotaData.fecha_vencimiento
                          );

                        if (
                          !Number.isNaN(
                            fechaVencimiento.getTime()
                          )
                        ) {

                          vencimiento =
                            fechaVencimiento.toLocaleDateString(
                              "es-AR"
                            );

                        }

                      }

                      return (

                        <div
                          className="payment-item"
                          key={idCuota}
                        >

                          <div>

                            <strong
                              style={{
                                textTransform:
                                  "capitalize",
                              }}
                            >
                              {nombreMes}
                            </strong>

                            <span>

                              {pagada
                                ? "Pago registrado"
                                : vencimiento
                                ? `Vencimiento: ${vencimiento}`
                                : "Pago pendiente"}

                              {" · "}

                              {montoFormateado}

                            </span>

                          </div>

                          {pagada ? (

                            <span className="payment-paid">
                              Pagado
                            </span>

                          ) : (

                            <button
                              type="button"
                              className="primary-button"
                              disabled={
                                pagandoCuota ===
                                idCuota
                              }
                              onClick={() =>
                                handlePagarCuota(
                                  idCuota
                                )
                              }
                            >

                              {pagandoCuota ===
                              idCuota
                                ? "Procesando..."
                                : "Pagar"}

                            </button>

                          )}

                        </div>

                      );

                    })}

                </div>

              )}

            </div>

          </section>

        )}

        {/* =================================================
            CRÉDITOS
        ================================================= */}
        {seccion === "creditos" && (
          <section className="dashboard-section">
            <div className="dashboard-card">
              <div className="card-header">
                <div>
                  <h3>Saldo y movimientos de créditos</h3>
                  <p>Consultá los créditos disponibles y su historial de movimientos.</p>
                </div>
                <button type="button" className="secondary-button" onClick={async () => {
                  if (!idAlumno) return;
                  try {
                    setLoadingCreditos(true);
                    const resumen = await obtenerResumenCreditos(idAlumno);
                    setResumenCreditos(resumen);
                    setErrorCreditos("");
                  } catch {
                    setErrorCreditos("No se pudo actualizar el saldo de créditos.");
                  } finally {
                    setLoadingCreditos(false);
                  }
                }}>Actualizar</button>
              </div>
              {loadingCreditos ? (
                <div className="empty-state"><p>Cargando créditos...</p></div>
              ) : errorCreditos ? (
                <div className="dashboard-warning">⚠️ {errorCreditos}</div>
              ) : (
                <>
                  <div className="stats-grid">
                    {resumenCreditos.saldos.map((saldo) => (
                      <div className="stat-card" key={saldo.id_tipo_credito}>
                        <div className="stat-icon">🎟️</div>
                        <div><span>{saldo.tipo_credito}</span><strong>{saldo.saldo}</strong><small>créditos disponibles</small></div>
                      </div>
                    ))}
                    {resumenCreditos.saldos.length === 0 && (
                      <div className="empty-state"><p>No hay tipos de crédito activos o todavía no tenés movimientos.</p></div>
                    )}
                  </div>
                  <div style={{display:"flex", justifyContent:"flex-end", marginTop:"20px"}}>
                    <button type="button" className="secondary-button" onClick={() => exportarCSV("mis_movimientos_creditos.csv", resumenCreditos.movimientos.map((m) => ({
                      fecha: fechaLocal(m.fecha),
                      tipo_credito: m.tipo_credito,
                      tipo_movimiento: m.tipo,
                      cantidad: m.cantidad,
                      paquete: m.paquete ?? "",
                      descripcion: m.descripcion ?? "",
                    })))}>⬇️ Exportar movimientos CSV</button>
                  </div>
                  <div className="table-responsive" style={{marginTop:"16px"}}>
                    <table className="attendance-table">
                      <thead><tr><th>Fecha</th><th>Tipo</th><th>Movimiento</th><th>Cantidad</th><th>Paquete</th><th>Detalle</th></tr></thead>
                      <tbody>
                        {resumenCreditos.movimientos.map((m) => (
                          <tr key={m.id_movimiento}>
                            <td>{fechaLocal(m.fecha)}</td>
                            <td>{m.tipo_credito}</td>
                            <td>{m.tipo}</td>
                            <td>{m.cantidad > 0 ? `+${m.cantidad}` : m.cantidad}</td>
                            <td>{m.paquete ?? "—"}</td>
                            <td>{m.descripcion ?? "—"}</td>
                          </tr>
                        ))}
                        {resumenCreditos.movimientos.length === 0 && <tr><td colSpan={6}>Todavía no hay movimientos de créditos.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* =================================================
            CALENDARIO
        ================================================= */}
        {seccion === "calendario" && (
          <section className="dashboard-section">
            <div className="dashboard-card">
              <div className="card-header">
                <div>
                  <h3>Mi calendario semanal</h3>
                  <p>Horarios informados en los grupos en los que estás inscripto.</p>
                </div>
              </div>
              {loadingGrupos ? (
                <div className="empty-state"><p>Cargando horarios...</p></div>
              ) : grupos.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🗓️</div>
                  <h3>Todavía no tenés grupos</h3>
                  <p>Cuando te inscribas en un grupo, sus horarios aparecerán acá.</p>
                  <button type="button" className="primary-button" onClick={() => setSeccion("inscribirme")}>Explorar grupos</button>
                </div>
              ) : (
                <div className="groups-grid">
                  {grupos.flatMap((grupo) =>
                    (grupo.horarios ?? []).map((horario, indice) => ({
                      ...horario,
                      id_grupo: grupo.id_grupo,
                      disciplina: grupo.disciplina,
                      nivel: grupo.nivel,
                      key: `${grupo.id_grupo}-${horario.id_horario ?? indice}`,
                    })),
                  ).sort((a, b) =>
                    String(a.dia_semana).localeCompare(String(b.dia_semana), "es"),
                  ).map((horario) => (
                    <article className="group-card" key={horario.key}>
                      <div className="group-card-header">
                        <span>{horario.dia_semana}</span>
                        <span>{horario.hora_inicio}–{horario.hora_fin}</span>
                      </div>
                      <h3>{horario.disciplina}</h3>
                      <p>Nivel: {horario.nivel}</p>
                      <p>Grupo #{horario.id_grupo}</p>
                    </article>
                  ))}
                  {grupos.every((grupo) => !grupo.horarios?.length) && (
                    <div className="empty-state">
                      <p>Tus grupos no tienen horarios cargados todavía.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* =================================================
            REPORTES Y EXPORTACIÓN
        ================================================= */}
        {seccion === "reportes" && (
          <section className="dashboard-section">
            <div className="dashboard-card">
              <div className="card-header">
                <div>
                  <h3>Mis reportes</h3>
                  <p>Descargá una copia de tus registros para consultarlos sin conexión.</p>
                </div>
              </div>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">📚</div>
                  <div><span>Grupos activos en tu cuenta</span><strong>{grupos.length}</strong></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">✅</div>
                  <div><span>Registros de asistencia</span><strong>{asistencias.length}</strong></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">💳</div>
                  <div><span>Cuotas registradas</span><strong>{cuotas.length}</strong></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">⏳</div>
                  <div>
                    <span>Cuotas pendientes</span>
                    <strong>{cuotas.filter((cuota) => {
                      const estado = estadoNormalizado((cuota as any).estado);
                      return !["pagado", "paga", "paid", "aprobado"].includes(estado) && !(cuota as any).fecha_pago;
                    }).length}</strong>
                  </div>
                </div>
              </div>
              <div className="dashboard-actions" style={{display:"flex", flexWrap:"wrap", gap:"12px", marginTop:"22px"}}>
                <button type="button" className="primary-button" onClick={() => exportarCSV("mis_asistencias.csv", asistencias.map((a) => ({
                  fecha: fechaLocal(a.fecha),
                  disciplina: a.disciplina ?? "",
                  grupo: a.grupo ?? "",
                  estado: a.estado,
                  observaciones: a.observaciones ?? "",
                })))}>⬇️ Descargar asistencias CSV</button>
                <button type="button" className="primary-button" onClick={() => exportarCSV("mis_cuotas.csv", cuotas.map((c) => ({
                  id_cuota: c.id_cuota,
                  mes: c.mes ?? "",
                  anio: c.anio ?? "",
                  monto: c.monto ?? c.paquete?.precio ?? "",
                  estado: c.estado ?? "",
                  vencimiento: fechaLocal(c.fecha_vencimiento),
                  fecha_pago: fechaLocal(c.fecha_pago),
                  paquete: c.paquete?.nombre ?? "",
                  creditos: c.paquete?.creditos ?? "",
                })))}>⬇️ Descargar cuotas CSV</button>
                <button type="button" className="secondary-button" onClick={() => exportarCSV("mis_grupos.csv", grupos.map((g) => ({
                  id_grupo: g.id_grupo,
                  disciplina: g.disciplina,
                  nivel: g.nivel,
                  profesor: g.profesor ?? "",
                  horarios: (g.horarios ?? []).map((h) => `${h.dia_semana} ${h.hora_inicio}-${h.hora_fin}`).join(" | "),
                })))}>⬇️ Descargar mis grupos CSV</button>
              </div>
              <p className="dashboard-help" style={{marginTop:"16px"}}>
                Los archivos contienen únicamente los datos que ya devuelve la aplicación. El estado definitivo de un pago debe verificarse con el backend y Mercado Pago.
              </p>
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



                  <h3>

                    Mi perfil

                  </h3>



                  <p>

                    Información personal

                  </p>



                </div>



              </div>



              <div className="profile-header">



                <div className="profile-avatar">



                  {nombreAlumno

                    ?.charAt(0)

                    ?.toUpperCase()}



                </div>



                <div>



                  <h2>

                    {nombreCompleto}

                  </h2>



                  <p>

                    Alumno

                  </p>



                </div>



              </div>



              <div className="student-info-grid">



                <div>



                  <span>

                    Nombre

                  </span>



                  <strong>

                    {nombreAlumno}

                  </strong>



                </div>



                <div>



                  <span>

                    Apellido

                  </span>



                  <strong>

                    {apellidoAlumno}

                  </strong>



                </div>



                <div>



                  <span>

                    Usuario

                  </span>



                  <strong>

                    {usuario?.username ??

                      usuario?.email ??

                      "-"}

                  </strong>



                </div>



                <div>



                  <span>

                    ID de alumno

                  </span>



                  <strong>

                    {idAlumno ?? "-"}

                  </strong>



                </div>



              </div>



            </div>



          </section>



        )}



      </main>



    </div>



  );



}
