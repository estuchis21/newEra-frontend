import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import { obtenerIdAlumnoPorUsuario } from "../services/auth.service";

import {
  inscribirseGrupo,
  eliminarInscripcion,
  obtenerGruposAlumno,
  obtenerGruposDisponibles,
  type Grupo,
} from "../services/grupos.service";

import {
  obtenerAsistencias,
  type Asistencia,
} from "../services/asistencia.service";

import {
  obtenerCuotasAlumno,
  crearPago,
  type Cuota,
} from "../services/cuotas-pagos.service";

import "./AlumnoDashboard.css";

// =====================================================
// TIPOS AUXILIARES
// =====================================================

type UsuarioGuardado = {
  id_usuario?: number | string;
  idUsuario?: number | string;
  id?: number | string;
  nombre?: string;
  apellido?: string;
  username?: string;
  email?: string;
};

type ErrorBackend = {
  response?: {
    data?: {
      message?: unknown;
      error?: unknown;
      errors?: unknown;
    };
  };
  message?: unknown;
};

// =====================================================
// FUNCIONES AUXILIARES
// =====================================================

function obtenerUsuarioGuardado(): UsuarioGuardado | null {
  try {
    const usuarioGuardado = localStorage.getItem("usuario");

    if (!usuarioGuardado) {
      return null;
    }

    const usuario: unknown = JSON.parse(usuarioGuardado);

    if (
      typeof usuario !== "object" ||
      usuario === null ||
      Array.isArray(usuario)
    ) {
      return null;
    }

    return usuario as UsuarioGuardado;
  } catch (error) {
    console.error("No se pudo leer el usuario guardado:", error);
    return null;
  }
}

/**
 * Extrae los mensajes de error que puede devolver NestJS.
 * Admite message como string, array u objeto, y contempla
 * errores de validación y errores de red.
 */
function obtenerMensajeError(
  error: unknown,
  mensajePredeterminado: string
): string {
  const errorBackend = error as ErrorBackend | null;

  const datos = errorBackend?.response?.data;

  const formatearMensaje = (mensaje: unknown): string | null => {
    if (typeof mensaje === "string" && mensaje.trim()) {
      return mensaje.trim();
    }

    if (typeof mensaje === "number") {
      return String(mensaje);
    }

    if (Array.isArray(mensaje)) {
      const mensajes = mensaje
        .map((item) => formatearMensaje(item))
        .filter((item): item is string => Boolean(item));

      return mensajes.length > 0
        ? [...new Set(mensajes)].join("\n")
        : null;
    }

    if (typeof mensaje === "object" && mensaje !== null) {
      const objeto = mensaje as Record<string, unknown>;

      const mensajeInterno =
        objeto.message ??
        objeto.mensaje ??
        objeto.error ??
        objeto.errors;

      if (mensajeInterno !== undefined) {
        return formatearMensaje(mensajeInterno);
      }
    }

    return null;
  };

  // Priorizar el mensaje de validación del backend.
  const mensajeBackend = formatearMensaje(datos?.message);

  if (mensajeBackend) {
    return mensajeBackend;
  }

  const erroresBackend = formatearMensaje(datos?.errors);

  if (erroresBackend) {
    return erroresBackend;
  }

  const errorBackendMensaje = formatearMensaje(datos?.error);

  if (errorBackendMensaje) {
    return errorBackendMensaje;
  }

  const mensajeCliente = formatearMensaje(errorBackend?.message);

  if (mensajeCliente) {
    return mensajeCliente;
  }

  return mensajePredeterminado;
}

function obtenerIdValido(valor: unknown): number | null {
  if (
    valor === null ||
    valor === undefined ||
    valor === ""
  ) {
    return null;
  }

  const id = Number(valor);

  return Number.isInteger(id) && id > 0
    ? id
    : null;
}

function obtenerMensajeCuota(cuota: Cuota): string {
  const cuotaData = cuota as unknown as Record<string, unknown>;

  const mes = Number(cuotaData.mes);
  const anio = Number(cuotaData.anio);

  if (
    Number.isInteger(mes) &&
    mes >= 1 &&
    mes <= 12
  ) {
    const fecha = new Date(
      anio || new Date().getFullYear(),
      mes - 1,
      1
    );

    return fecha.toLocaleDateString("es-AR", {
      month: "long",
      year: "numeric",
    });
  }

  const fechaReferencia =
    cuotaData.fecha_vencimiento ??
    cuotaData.fecha_pago;

  if (fechaReferencia) {
    const fecha = new Date(String(fechaReferencia));

    if (!Number.isNaN(fecha.getTime())) {
      return fecha.toLocaleDateString("es-AR", {
        month: "long",
        year: "numeric",
      });
    }
  }

  return "Cuota mensual";
}

// =====================================================
// COMPONENTE
// =====================================================

export default function AlumnoDashboard() {
  const navigate = useNavigate();

  // =====================================================
  // USUARIO
  // =====================================================

  const [usuario] = useState<UsuarioGuardado | null>(
    () => obtenerUsuarioGuardado()
  );

  // =====================================================
  // ALUMNO
  // =====================================================

  const [alumno, setAlumno] =
    useState<UsuarioGuardado | null>(null);

  const [idAlumno, setIdAlumno] =
    useState<number | null>(null);

  const [loadingAlumno, setLoadingAlumno] =
    useState(true);

  const [errorAlumno, setErrorAlumno] =
    useState("");

  // =====================================================
  // SECCIÓN
  // =====================================================

  const [seccion, setSeccion] = useState("inicio");

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

  const [errorGrupos, setErrorGrupos] = useState("");

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

  const [cuotas, setCuotas] = useState<Cuota[]>([]);

  const [loadingCuotas, setLoadingCuotas] =
    useState(false);

  const [errorCuotas, setErrorCuotas] = useState("");

  const [pagandoCuota, setPagandoCuota] =
    useState<number | null>(null);

  // =====================================================
  // OBTENER ID DEL ALUMNO
  // =====================================================

  useEffect(() => {
    const cargarAlumno = async () => {
      try {
        setLoadingAlumno(true);
        setErrorAlumno("");

        if (!usuario) {
          setErrorAlumno(
            "No se encontró información válida del usuario. Iniciá sesión nuevamente."
          );
          return;
        }

        const idUsuario = obtenerIdValido(
          usuario.id_usuario ??
            usuario.idUsuario ??
            usuario.id
        );

        if (!idUsuario) {
          setErrorAlumno(
            "No se pudo obtener un ID de usuario válido. Iniciá sesión nuevamente."
          );
          return;
        }

        const respuesta =
          await obtenerIdAlumnoPorUsuario(idUsuario);

        console.log("RESPUESTA DE NESTJS:", respuesta);

        // El servicio puede devolver un número o un ID representado
        // como string, según cómo esté implementado el backend.
        const idObtenido = obtenerIdValido(respuesta);

        if (!idObtenido) {
          setErrorAlumno(
            "No se pudo obtener un ID de alumno válido para este usuario."
          );
          return;
        }

        console.log("ID ALUMNO OBTENIDO:", idObtenido);

        setIdAlumno(idObtenido);
        setAlumno(usuario);
      } catch (error: unknown) {
        console.error("Error obteniendo alumno:", error);

        setErrorAlumno(
          obtenerMensajeError(
            error,
            "No se pudo obtener la información del alumno."
          )
        );
      } finally {
        setLoadingAlumno(false);
      }
    };

    void cargarAlumno();
  }, [usuario]);

  // =====================================================
  // CARGAR GRUPOS DEL ALUMNO
  // =====================================================

  const cargarGrupos = async () => {
    if (!idAlumno) return;

    try {
      setLoadingGrupos(true);
      setErrorGrupos("");

      const datos = await obtenerGruposAlumno(idAlumno);

      console.log("GRUPOS DEL ALUMNO:", datos);

      setGrupos(Array.isArray(datos) ? datos : []);
    } catch (error: unknown) {
      console.error("Error obteniendo grupos:", error);

      setErrorGrupos(
        obtenerMensajeError(
          error,
          "No se pudieron cargar tus grupos."
        )
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

      const datos = await obtenerGruposDisponibles();

      const lista = Array.isArray(datos) ? datos : [];

      console.log("GRUPOS DISPONIBLES:", lista);

      setGruposDisponibles(
        lista.filter((grupo) => grupo.activo !== false)
      );
    } catch (error: unknown) {
      console.error("Error obteniendo grupos disponibles:", error);

      setErrorGruposDisponibles(
        obtenerMensajeError(
          error,
          "No se pudieron cargar los grupos disponibles."
        )
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

      const datos = await obtenerAsistencias(idAlumno);

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
    } catch (error: unknown) {
      console.error("Error obteniendo asistencias:", error);

      setErrorAsistencias(
        obtenerMensajeError(
          error,
          "No se pudieron cargar tus asistencias."
        )
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

      console.log("CUOTAS DEL ALUMNO:", datos);

      setCuotas(Array.isArray(datos) ? datos : []);
    } catch (error: unknown) {
      console.error("Error obteniendo cuotas:", error);

      setErrorCuotas(
        obtenerMensajeError(
          error,
          "No se pudieron cargar las cuotas."
        )
      );

      setCuotas([]);
    } finally {
      setLoadingCuotas(false);
    }
  };

  // =====================================================
  // PAGAR CUOTA
  // =====================================================

  const handlePagarCuota = async (idCuota: number) => {
    if (!obtenerIdValido(idCuota)) {
      await Swal.fire({
        icon: "error",
        title: "Cuota inválida",
        text: "No se pudo identificar la cuota que querés pagar.",
        confirmButtonText: "Aceptar",
      });
      return;
    }

    try {
      setPagandoCuota(idCuota);

      const resultado = await crearPago(idCuota);

      console.log("RESPUESTA CREAR PAGO:", resultado);

      const url =
        resultado?.init_point ??
        resultado?.sandbox_init_point ??
        resultado?.url;

      if (typeof url === "string" && url.trim()) {
        window.location.href = url;
        return;
      }

      await Swal.fire({
        icon: "success",
        title: "Pago creado",
        text: "Se creó correctamente el pago, pero el backend no devolvió una URL de pago.",
        confirmButtonText: "Aceptar",
      });

      await cargarCuotas();
    } catch (error: unknown) {
      console.error("Error creando pago:", error);

      await Swal.fire({
        icon: "error",
        title: "No se pudo iniciar el pago",
        text: obtenerMensajeError(
          error,
          "No se pudo iniciar el pago."
        ),
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

    void cargarGrupos();
    void cargarAsistencias();
    void cargarCuotas();

    // Se ejecuta cuando se identifica al alumno.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idAlumno]);

  // =====================================================
  // CUANDO ENTRA EN INSCRIBIRME
  // =====================================================

  useEffect(() => {
    if (seccion === "inscribirme") {
      void cargarGruposDisponibles();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seccion]);

  // =====================================================
  // INSCRIBIRSE A UN GRUPO
  // =====================================================

  const handleInscribirse = async (idGrupo: number) => {
    if (!idAlumno) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo identificar al alumno.",
        confirmButtonText: "Aceptar",
      });

      return;
    }

    if (!obtenerIdValido(idGrupo)) {
      await Swal.fire({
        icon: "error",
        title: "Grupo inválido",
        text: "No se pudo identificar el grupo seleccionado.",
        confirmButtonText: "Aceptar",
      });

      return;
    }

    try {
      setInscribiendo(idGrupo);
      setMensajeInscripcion("");

      await inscribirseGrupo(idAlumno, idGrupo);

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
    } catch (error: unknown) {
      console.error("Error inscribiendo:", error);

      const mensaje = obtenerMensajeError(
        error,
        "No se pudo realizar la inscripción."
      );

      setMensajeInscripcion(mensaje);

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
    if (!obtenerIdValido(idInscripcion)) {
      await Swal.fire({
        icon: "error",
        title: "Inscripción inválida",
        text: "No se pudo identificar la inscripción que querés cancelar.",
        confirmButtonText: "Aceptar",
      });

      return;
    }

    try {
      const resultado = await Swal.fire({
        icon: "warning",
        title: "¿Cancelar inscripción?",
        text: "Se eliminará tu inscripción y se devolverá el crédito utilizado.",
        showCancelButton: true,
        confirmButtonText: "Sí, cancelar",
        cancelButtonText: "No",
        confirmButtonColor: "#d33",
      });

      if (!resultado.isConfirmed) {
        return;
      }

      setEliminandoInscripcion(idInscripcion);

      await eliminarInscripcion(idInscripcion);

      await Swal.fire({
        icon: "success",
        title: "Inscripción cancelada",
        text: "La inscripción fue eliminada y se devolvió el crédito.",
        confirmButtonText: "Aceptar",
      });

      await cargarGrupos();
      await cargarGruposDisponibles();
    } catch (error: unknown) {
      console.error("Error eliminando inscripción:", error);

      await Swal.fire({
        icon: "error",
        title: "No se pudo cancelar la inscripción",
        text: obtenerMensajeError(
          error,
          "No se pudo eliminar la inscripción."
        ),
        confirmButtonText: "Aceptar",
      });
    } finally {
      setEliminandoInscripcion(null);
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
        <p>Cargando información del alumno...</p>
      </div>
    );
  }

  // =====================================================
  // ERROR ALUMNO
  // =====================================================

  if (errorAlumno) {
    return (
      <div className="dashboard-error">
        <h2>Error</h2>
        <p>{errorAlumno}</p>

        <button onClick={cerrarSesion}>
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
// FILTRAR GRUPOS EN LOS QUE YA ESTÁ INSCRIPTO
// =====================================================

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="alumno-dashboard">
      {/* SIDEBAR */}

      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">NE</div>

          <div>
            <h2>New Era</h2>
            <span>Academy</span>
          </div>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">
            {nombreAlumno.charAt(0).toUpperCase()}
          </div>

          <div>
            <strong>{nombreCompleto}</strong>
            <span>Alumno</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={seccion === "inicio" ? "active" : ""}
            onClick={() => setSeccion("inicio")}
          >
            🏠 <span>Inicio</span>
          </button>

          <button
            className={seccion === "grupos" ? "active" : ""}
            onClick={() => setSeccion("grupos")}
          >
            👥 <span>Mis grupos</span>
          </button>

          <button
            className={seccion === "asistencia" ? "active" : ""}
            onClick={() => setSeccion("asistencia")}
          >
            📋 <span>Asistencia</span>
          </button>

          <button
            className={seccion === "inscribirme" ? "active" : ""}
            onClick={() => setSeccion("inscribirme")}
          >
            ➕ <span>Inscribirme</span>
          </button>

          <button
            className={seccion === "cuotas" ? "active" : ""}
            onClick={() => setSeccion("cuotas")}
          >
            💳 <span>Cuotas</span>
          </button>

          <button
            className={seccion === "perfil" ? "active" : ""}
            onClick={() => setSeccion("perfil")}
          >
            👤 <span>Mi perfil</span>
          </button>
        </nav>

        <button
          className="logout-button"
          onClick={cerrarSesion}
        >
          🚪 <span>Cerrar sesión</span>
        </button>
      </aside>

      {/* CONTENIDO */}

      <main className="dashboard-main">
        {/* HEADER */}

        <header className="dashboard-header">
          <div>
            <h1>
              {seccion === "inicio" && "¡Bienvenido de nuevo!"}
              {seccion === "grupos" && "Mis grupos"}
              {seccion === "asistencia" && "Mi asistencia"}
              {seccion === "inscribirme" && "Inscribirme"}
              {seccion === "cuotas" && "Mis cuotas"}
              {seccion === "perfil" && "Mi perfil"}
            </h1>

            <p>
              {seccion === "inicio"
                ? "Este es tu resumen académico."
                : "Gestioná tu información desde aquí."}
            </p>
          </div>

          <div className="header-user">
            <div className="header-avatar">
              {nombreAlumno.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* INICIO */}

        {seccion === "inicio" && (
          <section className="dashboard-section">
            <div className="welcome-card">
              <div>
                <span>¡Hola!</span>
                <h2>{nombreCompleto}</h2>
                <p>
                  Seguí disfrutando de tus clases y alcanzá tus objetivos.
                </p>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div>
                  <span>Mis grupos</span>
                  <strong>{grupos.length}</strong>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📋</div>
                <div>
                  <span>Asistencias</span>
                  <strong>{asistencias.length}</strong>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">💳</div>
                <div>
                  <span>Cuotas</span>
                  <strong>{cuotas.length}</strong>
                </div>
              </div>
            </div>

            <div className="dashboard-card">
              <div className="card-header">
                <div>
                  <h3>Información del alumno</h3>
                  <p>Tus datos registrados</p>
                </div>
              </div>

              <div className="student-info-grid">
                <div>
                  <span>Nombre</span>
                  <strong>{nombreAlumno}</strong>
                </div>

                <div>
                  <span>Apellido</span>
                  <strong>{apellidoAlumno}</strong>
                </div>

                <div>
                  <span>Usuario</span>
                  <strong>
                    {usuario?.username ?? usuario?.email ?? "-"}
                  </strong>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* MIS GRUPOS */}

        {seccion === "grupos" && (
          <section className="dashboard-section">
            <div className="dashboard-card">
              <div className="card-header">
                <div>
                  <h3>Mis grupos</h3>
                  <p>Grupos en los que estás inscripto</p>
                </div>
              </div>

              {loadingGrupos ? (
                <div className="empty-state">
                  <p>Cargando grupos...</p>
                </div>
              ) : errorGrupos ? (
                <div className="dashboard-warning" role="alert">
                  ⚠️ {errorGrupos}
                </div>
              ) : grupos.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">👥</div>
                  <h3>No tenés grupos</h3>
                  <p>
                    Todavía no estás inscripto en ningún grupo.
                  </p>

                  <button
                    className="primary-button"
                    onClick={() => setSeccion("inscribirme")}
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
                        <span>{grupo.disciplina}</span>
                        <span>{grupo.nivel}</span>
                      </div>

                      <h3>{grupo.disciplina}</h3>
                      <p>Nivel: {grupo.nivel}</p>

                      {grupo.profesor && (
                        <p>👨‍🏫 Profesor: {grupo.profesor}</p>
                      )}

                      {grupo.horarios &&
                        grupo.horarios.length > 0 && (
                          <div className="group-schedule">
                            {grupo.horarios.map((horario) => (
                              <div key={horario.id_horario}>
                                📅 {horario.dia_semana}
                                <br />
                                🕐 {horario.hora_inicio}
                                {" - "}
                                {horario.hora_fin}
                              </div>
                            ))}
                          </div>
                        )}

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

        {/* ASISTENCIA */}

        {seccion === "asistencia" && (
          <section className="dashboard-section">
            <div className="dashboard-card">
              <div className="card-header">
                <div>
                  <h3>Historial de asistencia</h3>
                  <p>Consultá tus asistencias</p>
                </div>
              </div>

              {loadingAsistencias ? (
                <div className="empty-state">
                  <p>Cargando asistencias...</p>
                </div>
              ) : errorAsistencias ? (
                <div className="dashboard-warning" role="alert">
                  ⚠️ {errorAsistencias}
                </div>
              ) : asistencias.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <h3>No hay asistencias</h3>
                  <p>
                    Todavía no tenés asistencias registradas.
                  </p>
                </div>
              ) : (
                <div className="attendance-table-wrapper">
                  <table className="attendance-table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Grupo</th>
                        <th>Disciplina</th>
                        <th>Estado</th>
                      </tr>
                    </thead>

                    <tbody>
                      {asistencias.map((asistencia) => (
                        <tr key={asistencia.id_asistencia}>
                          <td>
                            {asistencia.fecha
                              ? new Date(
                                  asistencia.fecha
                                ).toLocaleDateString("es-AR")
                              : "-"}
                          </td>

                          <td>{asistencia.grupo ?? "-"}</td>
                          <td>{asistencia.disciplina ?? "-"}</td>

                          <td>
                            <span
                              className={
                                asistencia.estado?.toLowerCase() ===
                                "presente"
                                  ? "status-present"
                                  : "status-absent"
                              }
                            >
                              {asistencia.estado}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}

        {/* INSCRIBIRME */}

        {seccion === "inscribirme" && (
          <section className="dashboard-section">
            {mensajeInscripcion && (
              <div
                className="dashboard-success"
                role="status"
                aria-live="polite"
              >
                {mensajeInscripcion}
              </div>
            )}

            <div className="dashboard-card">
              <div className="card-header">
                <div>
                  <h3>Grupos disponibles</h3>
                  <p>
                    Elegí el grupo al que querés inscribirte.
                  </p>
                </div>
              </div>

              {/*
                Obtenemos los identificadores de los grupos
                en los que el alumno ya está inscripto.
              */}
              {(() => {
                const idsGruposInscritos = new Set(
                  grupos.map((grupo) => Number(grupo.id_grupo))
                );

                const gruposDisponiblesFiltrados =
                  gruposDisponibles.filter(
                    (grupo) =>
                      grupo.activo !== false &&
                      !idsGruposInscritos.has(
                        Number(grupo.id_grupo)
                      )
                  );

                return loadingGruposDisponibles ? (
                  <div className="empty-state">
                    <p>Cargando grupos disponibles...</p>
                  </div>
                ) : errorGruposDisponibles ? (
                  <div
                    className="dashboard-warning"
                    role="alert"
                  >
                    ⚠️ {errorGruposDisponibles}
                  </div>
                ) : gruposDisponiblesFiltrados.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📚</div>
                    <h3>No hay grupos disponibles</h3>
                    <p>
                      En este momento no hay grupos disponibles
                      para inscribirse.
                    </p>
                  </div>
                ) : (
                  <div className="groups-grid">
                    {gruposDisponiblesFiltrados.map((grupo) => (
                      <div
                        className="group-card"
                        key={grupo.id_grupo}
                      >
                        <div className="group-card-header">
                          <span>{grupo.disciplina}</span>
                          <span>{grupo.nivel}</span>
                        </div>

                        <h3>{grupo.disciplina}</h3>
                        <p>Nivel: {grupo.nivel}</p>

                        {grupo.profesor && (
                          <p>
                            👨‍🏫 Profesor: {grupo.profesor}
                          </p>
                        )}

                        {grupo.horarios &&
                          grupo.horarios.length > 0 && (
                            <div className="group-schedule">
                              {grupo.horarios.map((horario) => (
                                <div
                                  key={horario.id_horario}
                                >
                                  📅 {horario.dia_semana}
                                  <br />
                                  🕐 {horario.hora_inicio}
                                  {" - "}
                                  {horario.hora_fin}
                                </div>
                              ))}
                            </div>
                          )}

                        <button
                          type="button"
                          className="primary-button"
                          disabled={
                            inscribiendo === grupo.id_grupo
                          }
                          onClick={() =>
                            handleInscribirse(grupo.id_grupo)
                          }
                        >
                          {inscribiendo === grupo.id_grupo
                            ? "Inscribiendo..."
                            : "Inscribirme"}
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </section>
        )}
        {/* CUOTAS */}

        {seccion === "cuotas" && (
          <section className="dashboard-section">
            <div className="dashboard-card">
              <div className="card-header">
                <div>
                  <h3>Mis cuotas</h3>
                  <p>
                    Consultá tus cuotas mensuales y realizá tus pagos.
                  </p>
                </div>
              </div>

              {loadingCuotas ? (
                <div className="empty-state">
                  <p>Cargando cuotas...</p>
                </div>
              ) : errorCuotas ? (
                <div className="dashboard-warning" role="alert">
                  ⚠️ {errorCuotas}
                </div>
              ) : cuotas.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">💳</div>
                  <h3>No tenés cuotas registradas</h3>
                  <p>
                    Todavía no hay cuotas asociadas a tu cuenta.
                  </p>
                </div>
              ) : (
                <div className="payment-history">
                  <h3>Historial mensual</h3>

                  {cuotas
                    .slice()
                    .sort((a, b) => {
                      const cuotaA =
                        a as unknown as Record<string, unknown>;

                      const cuotaB =
                        b as unknown as Record<string, unknown>;

                      const fechaA = new Date(
                        String(
                          cuotaA.fecha_vencimiento ??
                            cuotaA.fecha_pago ??
                            ""
                        )
                      ).getTime();

                      const fechaB = new Date(
                        String(
                          cuotaB.fecha_vencimiento ??
                            cuotaB.fecha_pago ??
                            ""
                        )
                      ).getTime();

                      return (
                        (Number.isNaN(fechaB) ? 0 : fechaB) -
                        (Number.isNaN(fechaA) ? 0 : fechaA)
                      );
                    })
                    .map((cuota) => {
                      const cuotaData =
                        cuota as unknown as Record<string, unknown>;

                      const idCuota = obtenerIdValido(
                        cuotaData.id_cuota
                      );

                      const estado = String(
                        cuotaData.estado ?? ""
                      ).toLowerCase();

                      const pagada =
                        estado === "pagado" ||
                        estado === "pagada" ||
                        estado === "paga" ||
                        estado === "paid" ||
                        Boolean(cuotaData.fecha_pago);

                      const monto =
                        cuotaData.monto ??
                        cuotaData.precio ??
                        (
                          cuotaData.paquete as
                            | Record<string, unknown>
                            | undefined
                        )?.precio;

                      const montoNumerico =
                        monto !== undefined &&
                        monto !== null &&
                        monto !== ""
                          ? Number(monto)
                          : null;

                      const montoFormateado =
                        montoNumerico !== null &&
                        Number.isFinite(montoNumerico)
                          ? montoNumerico.toLocaleString(
                              "es-AR",
                              {
                                style: "currency",
                                currency: "ARS",
                              }
                            )
                          : "-";

                      let vencimiento = "";

                      if (cuotaData.fecha_vencimiento) {
                        const fechaVencimiento = new Date(
                          String(cuotaData.fecha_vencimiento)
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
                          key={
                            idCuota ??
                            String(cuotaData.id_cuota ?? Math.random())
                          }
                        >
                          <div>
                            <strong
                              style={{
                                textTransform: "capitalize",
                              }}
                            >
                              {obtenerMensajeCuota(cuota)}
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
                                idCuota === null ||
                                pagandoCuota === idCuota
                              }
                              onClick={() => {
                                if (idCuota !== null) {
                                  void handlePagarCuota(idCuota);
                                }
                              }}
                            >
                              {pagandoCuota === idCuota
                                ? "Procesando..."
                                : idCuota === null
                                  ? "Cuota inválida"
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

        {/* PERFIL */}

        {seccion === "perfil" && (
          <section className="dashboard-section">
            <div className="dashboard-card">
              <div className="card-header">
                <div>
                  <h3>Mi perfil</h3>
                  <p>Información personal</p>
                </div>
              </div>

              <div className="profile-header">
                <div className="profile-avatar">
                  {nombreAlumno.charAt(0).toUpperCase()}
                </div>

                <div>
                  <h2>{nombreCompleto}</h2>
                  <p>Alumno</p>
                </div>
              </div>

              <div className="student-info-grid">
                <div>
                  <span>Nombre</span>
                  <strong>{nombreAlumno}</strong>
                </div>

                <div>
                  <span>Apellido</span>
                  <strong>{apellidoAlumno}</strong>
                </div>

                <div>
                  <span>Usuario</span>
                  <strong>
                    {usuario?.username ?? usuario?.email ?? "-"}
                  </strong>
                </div>

                <div>
                  <span>ID de alumno</span>
                  <strong>{idAlumno ?? "-"}</strong>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}