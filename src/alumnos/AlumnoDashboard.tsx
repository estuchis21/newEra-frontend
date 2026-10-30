
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
  verificarAccesoAlumno,
  crearPago,
  type Cuota,
} from "../services/cuotas-pagos.service";

import { obtenerBoletinesAlumno } from "../services/botelines.service";

import {
  obtenerPersonasAutorizadas,
  obtenerHistorialRetiros,
  type PersonaAutorizada,
  type RetiroMenor,
} from "../services/retiro-menores.service";

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

type BoletinAlumno = {
  id_boletin: number;
  id_alumno: number;
  id_grupo: number;
  id_profesor: number;
  id_periodo: number;
  periodo?: string;
  anio: number;
  fecha_evaluacion: string;
  observaciones: string | null;
  disciplina?: string;
  grupo?: string;
  profesor?: string;
  nombre_profesor?: string;
  apellido_profesor?: string;
};

// =====================================================
// FUNCIONES AUXILIARES
// =====================================================

function obtenerUsuarioGuardado(): UsuarioGuardado | null {
  try {
    const usuarioGuardado = localStorage.getItem("usuario");

    if (!usuarioGuardado) return null;

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

  const mensajeBackend = formatearMensaje(datos?.message);
  if (mensajeBackend) return mensajeBackend;

  const erroresBackend = formatearMensaje(datos?.errors);
  if (erroresBackend) return erroresBackend;

  const errorBackendMensaje = formatearMensaje(datos?.error);
  if (errorBackendMensaje) return errorBackendMensaje;

  const mensajeCliente = formatearMensaje(errorBackend?.message);
  if (mensajeCliente) return mensajeCliente;

  return mensajePredeterminado;
}

function obtenerIdValido(valor: unknown): number | null {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  const id = Number(valor);

  return Number.isInteger(id) && id > 0 ? id : null;
}

function obtenerMensajeCuota(cuota: Cuota): string {
  const cuotaData = cuota as unknown as Record<string, unknown>;

  const mes = Number(cuotaData.mes);
  const anio = Number(cuotaData.anio);

  if (Number.isInteger(mes) && mes >= 1 && mes <= 12) {
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
    cuotaData.fecha_vencimiento ?? cuotaData.fecha_pago;

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

function formatearFecha(fecha?: string | null): string {
  if (!fecha) return "-";

  const fechaNormalizada = String(fecha).slice(0, 10);
  const date = new Date(`${fechaNormalizada}T12:00:00`);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("es-AR");
}

function formatearFechaHora(fecha?: string | null): string {
  if (!fecha) return "-";

  const date = new Date(fecha);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("es-AR");
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

  const [loadingAlumno, setLoadingAlumno] = useState(true);
  const [errorAlumno, setErrorAlumno] = useState("");

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

  const [loadingGrupos, setLoadingGrupos] = useState(false);
  const [loadingGruposDisponibles, setLoadingGruposDisponibles] =
    useState(false);

  const [errorGrupos, setErrorGrupos] = useState("");
  const [errorGruposDisponibles, setErrorGruposDisponibles] =
    useState("");

  // =====================================================
  // INSCRIPCIONES
  // =====================================================

  const [inscribiendo, setInscribiendo] =
    useState<number | null>(null);

  const [mensajeInscripcion, setMensajeInscripcion] = useState("");

  const [eliminandoInscripcion, setEliminandoInscripcion] =
    useState<number | null>(null);

  // =====================================================
  // ASISTENCIAS
  // =====================================================

  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [loadingAsistencias, setLoadingAsistencias] = useState(false);
  const [errorAsistencias, setErrorAsistencias] = useState("");

  // =====================================================
  // BOLETINES
  // =====================================================

  const [boletines, setBoletines] = useState<BoletinAlumno[]>([]);
  const [loadingBoletines, setLoadingBoletines] = useState(false);
  const [errorBoletines, setErrorBoletines] = useState("");

  // =====================================================
  // PERSONAS AUTORIZADAS
  // =====================================================

  const [personasAutorizadas, setPersonasAutorizadas] =
    useState<PersonaAutorizada[]>([]);

  const [loadingPersonasAutorizadas, setLoadingPersonasAutorizadas] =
    useState(false);

  const [errorPersonasAutorizadas, setErrorPersonasAutorizadas] =
    useState("");

  // =====================================================
  // HISTORIAL DE RETIROS
  // =====================================================

  const [historialRetiros, setHistorialRetiros] =
    useState<RetiroMenor[]>([]);

  const [loadingRetiros, setLoadingRetiros] = useState(false);
  const [errorRetiros, setErrorRetiros] = useState("");

  // =====================================================
  // CUOTAS
  // =====================================================

  const [cuotas, setCuotas] = useState<Cuota[]>([]);
  const [loadingCuotas, setLoadingCuotas] = useState(false);
  const [errorCuotas, setErrorCuotas] = useState("");

  const [pagandoCuota, setPagandoCuota] =
    useState<number | null>(null);

  // =====================================================
  // CONTROL DE ACCESO
  // =====================================================

  const [accesoPermitido, setAccesoPermitido] =
    useState<boolean | null>(null);

  const [loadingAcceso, setLoadingAcceso] = useState(false);
  const [errorAcceso, setErrorAcceso] = useState("");

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

        const idObtenido = obtenerIdValido(respuesta);

        if (!idObtenido) {
          setErrorAlumno(
            "No se pudo obtener un ID de alumno válido para este usuario."
          );
          return;
        }

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
  // VERIFICAR ACCESO
  // =====================================================

  const cargarEstadoAcceso = async () => {
    if (!idAlumno) return;

    try {
      setLoadingAcceso(true);
      setErrorAcceso("");

      const resultado = await verificarAccesoAlumno(idAlumno);

      setAccesoPermitido(resultado.puedeAcceder);

      if (!resultado.puedeAcceder) {
        setSeccion("cuotas");
      }
    } catch (error: unknown) {
      console.error("Error verificando acceso:", error);

      setAccesoPermitido(false);

      setErrorAcceso(
        obtenerMensajeError(
          error,
          "No se pudo verificar el estado de tu cuota. Intentá nuevamente."
        )
      );
    } finally {
      setLoadingAcceso(false);
    }
  };

  // =====================================================
  // CARGAR GRUPOS
  // =====================================================

  const cargarGrupos = async () => {
    if (!idAlumno) return;

    try {
      setLoadingGrupos(true);
      setErrorGrupos("");

      const datos = await obtenerGruposAlumno(idAlumno);

      setGrupos(Array.isArray(datos) ? datos : []);
    } catch (error: unknown) {
      console.error("Error obteniendo grupos:", error);

      setErrorGrupos(
        obtenerMensajeError(error, "No se pudieron cargar tus grupos.")
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

      setAsistencias(Array.isArray(datos) ? datos : []);
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
  // CARGAR BOLETINES
  // =====================================================

  const cargarBoletines = async () => {
    if (!idAlumno) return;

    try {
      setLoadingBoletines(true);
      setErrorBoletines("");

      const datos = await obtenerBoletinesAlumno(idAlumno);

      setBoletines(
        Array.isArray(datos) ? (datos as BoletinAlumno[]) : []
      );
    } catch (error: unknown) {
      console.error("Error obteniendo boletines:", error);

      setErrorBoletines(
        obtenerMensajeError(
          error,
          "No se pudieron cargar tus boletines."
        )
      );

      setBoletines([]);
    } finally {
      setLoadingBoletines(false);
    }
  };

  // =====================================================
  // CARGAR PERSONAS AUTORIZADAS
  // =====================================================

  const cargarPersonasAutorizadas = async () => {
    if (!idAlumno) return;

    try {
      setLoadingPersonasAutorizadas(true);
      setErrorPersonasAutorizadas("");

      const datos = await obtenerPersonasAutorizadas(idAlumno);

      setPersonasAutorizadas(
        Array.isArray(datos)
          ? datos.filter((persona) => persona.activo !== false)
          : []
      );
    } catch (error: unknown) {
      console.error("Error obteniendo personas autorizadas:", error);

      setErrorPersonasAutorizadas(
        obtenerMensajeError(
          error,
          "No se pudieron cargar las personas autorizadas."
        )
      );

      setPersonasAutorizadas([]);
    } finally {
      setLoadingPersonasAutorizadas(false);
    }
  };

  // =====================================================
  // CARGAR HISTORIAL DE RETIROS
  // =====================================================

  const cargarHistorialRetiros = async () => {
    if (!idAlumno) return;

    try {
      setLoadingRetiros(true);
      setErrorRetiros("");

      const datos = await obtenerHistorialRetiros({
        id_alumno: idAlumno,
      });

      setHistorialRetiros(
        Array.isArray(datos) ? datos : []
      );
    } catch (error: unknown) {
      console.error("Error obteniendo historial de retiros:", error);

      setErrorRetiros(
        obtenerMensajeError(
          error,
          "No se pudo cargar el historial de retiros."
        )
      );

      setHistorialRetiros([]);
    } finally {
      setLoadingRetiros(false);
    }
  };

  // =====================================================
  // CARGAR CUOTAS
  // =====================================================

  const cargarCuotas = async () => {
    if (!idAlumno) return;

    try {
      setLoadingCuotas(true);
      setErrorCuotas("");

      const datos = await obtenerCuotasAlumno(idAlumno);

      setCuotas(Array.isArray(datos) ? datos : []);
    } catch (error: unknown) {
      console.error("Error obteniendo cuotas:", error);

      setErrorCuotas(
        obtenerMensajeError(error, "No se pudieron cargar las cuotas.")
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
        text: "Se creó el pago, pero el backend no devolvió una URL de pago.",
        confirmButtonText: "Aceptar",
      });

      await cargarCuotas();
    } catch (error: unknown) {
      console.error("Error creando pago:", error);

      await Swal.fire({
        icon: "error",
        title: "No se pudo iniciar el pago",
        text: obtenerMensajeError(error, "No se pudo iniciar el pago."),
        confirmButtonText: "Aceptar",
      });
    } finally {
      setPagandoCuota(null);
    }
  };

  // =====================================================
  // CARGA INICIAL
  // =====================================================

  useEffect(() => {
    if (!idAlumno) return;

    void cargarEstadoAcceso();
    void cargarCuotas();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idAlumno]);

  // =====================================================
  // CARGAR INFORMACIÓN ACADÉMICA
  // =====================================================

  useEffect(() => {
    if (!idAlumno || accesoPermitido !== true) return;

    void cargarGrupos();
    void cargarAsistencias();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idAlumno, accesoPermitido]);

  // =====================================================
  // CARGAR BOLETINES Y RETIROS
  // =====================================================

  useEffect(() => {
    if (!idAlumno) return;

    void cargarBoletines();
    void cargarPersonasAutorizadas();
    void cargarHistorialRetiros();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idAlumno]);

  // =====================================================
  // CARGAR GRUPOS DISPONIBLES
  // =====================================================

  useEffect(() => {
    if (seccion !== "inscribirme") return;

    void cargarGruposDisponibles();

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
      });
      return;
    }

    if (!obtenerIdValido(idGrupo)) {
      await Swal.fire({
        icon: "error",
        title: "Grupo inválido",
        text: "No se pudo identificar el grupo seleccionado.",
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
        text: "No se pudo identificar la inscripción.",
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

      if (!resultado.isConfirmed) return;

      setEliminandoInscripcion(idInscripcion);

      await eliminarInscripcion(idInscripcion);

      await Swal.fire({
        icon: "success",
        title: "Inscripción cancelada",
        text: "La inscripción fue eliminada y se devolvió el crédito.",
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
  // ESTADOS DE CARGA Y ERROR
  // =====================================================

  if (loadingAlumno) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />
        <p>Cargando información del alumno...</p>
      </div>
    );
  }

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

  if (loadingAcceso || accesoPermitido === null) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />
        <p>Verificando el estado de tu cuota...</p>
      </div>
    );
  }

  // =====================================================
  // DATOS DEL ALUMNO
  // =====================================================

  const nombreAlumno = alumno?.nombre ?? usuario?.nombre ?? "Alumno";
  const apellidoAlumno = alumno?.apellido ?? usuario?.apellido ?? "";

  const nombreCompleto =
    `${nombreAlumno} ${apellidoAlumno}`.trim();

  const gruposInscritos = new Set(
    grupos.map((grupo) => Number(grupo.id_grupo))
  );

  const gruposDisponiblesFiltrados =
    gruposDisponibles.filter(
      (grupo) =>
        grupo.activo !== false &&
        !gruposInscritos.has(Number(grupo.id_grupo))
    );

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
          {/* FUNCIONES ACADÉMICAS CON ACCESO HABILITADO */}

          {accesoPermitido && (
            <>
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
            </>
          )}

          {/* BOLETINES Y RETIROS */}

          <button
            className={seccion === "boletines" ? "active" : ""}
            onClick={() => setSeccion("boletines")}
          >
            📑 <span>Mis boletines</span>
          </button>

          <button
            className={seccion === "retiros" ? "active" : ""}
            onClick={() => setSeccion("retiros")}
          >
            👨‍👩‍👧 <span>Personas autorizadas</span>
          </button>

          <button
            className={
              seccion === "historial-retiros" ? "active" : ""
            }
            onClick={() => setSeccion("historial-retiros")}
          >
            🕒 <span>Historial de retiros</span>
          </button>

          {/* CUOTAS Y PERFIL */}

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

        <button className="logout-button" onClick={cerrarSesion}>
          🚪 <span>Cerrar sesión</span>
        </button>
      </aside>

      {/* =================================================
          CONTENIDO PRINCIPAL
      ================================================= */}

      <main className="dashboard-main">
        {/* HEADER */}

        <header className="dashboard-header">
          <div>
            <h1>
              {seccion === "inicio" && "¡Bienvenido de nuevo!"}
              {seccion === "grupos" && "Mis grupos"}
              {seccion === "asistencia" && "Mi asistencia"}
              {seccion === "inscribirme" && "Inscribirme"}
              {seccion === "boletines" && "Mis boletines"}
              {seccion === "retiros" && "Personas autorizadas"}
              {seccion === "historial-retiros" &&
                "Historial de retiros"}
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

        {/* RESTRICCIÓN DE ACCESO */}

        {!accesoPermitido && (
          <div className="dashboard-warning" role="alert">
            <strong>Acceso académico restringido.</strong>

            <p>
              {errorAcceso ||
                "Tenés una cuota pendiente. Podés consultar tus cuotas y realizar el pago desde esta sección."}
            </p>

            <div className="restriction-actions">
              <button
                type="button"
                className="primary-button"
                onClick={() => setSeccion("cuotas")}
              >
                Ir a mis cuotas
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={() => void cargarEstadoAcceso()}
                disabled={loadingAcceso}
              >
                {loadingAcceso
                  ? "Verificando..."
                  : "Actualizar estado de pago"}
              </button>
            </div>
          </div>
        )}

        {/* =================================================
            INICIO
        ================================================= */}

        {accesoPermitido && seccion === "inicio" && (
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

              <div className="stat-card">
                <div className="stat-icon">📑</div>
                <div>
                  <span>Boletines</span>
                  <strong>{boletines.length}</strong>
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

        {/* =================================================
            MIS GRUPOS
        ================================================= */}

        {accesoPermitido && seccion === "grupos" && (
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
                  {errorGrupos}
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

        {/* =================================================
            ASISTENCIAS
        ================================================= */}

        {accesoPermitido && seccion === "asistencia" && (
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
                  {errorAsistencias}
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
                              ? formatearFecha(asistencia.fecha)
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

        {/* =================================================
            INSCRIBIRME
        ================================================= */}

        {accesoPermitido && seccion === "inscribirme" && (
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

              {loadingGruposDisponibles ? (
                <div className="empty-state">
                  <p>Cargando grupos disponibles...</p>
                </div>
              ) : errorGruposDisponibles ? (
                <div className="dashboard-warning" role="alert">
                  {errorGruposDisponibles}
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
              )}
            </div>
          </section>
        )}

        {/* =================================================
            BOLETINES
        ================================================= */}

        {seccion === "boletines" && (
          <section className="dashboard-section">
            <div className="dashboard-card">
              <div className="card-header">
                <div>
                  <h3>Mis boletines</h3>
                  <p>
                    Consultá tus evaluaciones y observaciones de los
                    profesores.
                  </p>
                </div>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => void cargarBoletines()}
                  disabled={loadingBoletines}
                >
                  {loadingBoletines
                    ? "Actualizando..."
                    : "Actualizar"}
                </button>
              </div>

              {loadingBoletines ? (
                <div className="empty-state">
                  <p>Cargando boletines...</p>
                </div>
              ) : errorBoletines ? (
                <div className="dashboard-warning" role="alert">
                  {errorBoletines}
                </div>
              ) : boletines.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📑</div>
                  <h3>Todavía no tenés boletines</h3>
                  <p>
                    Cuando tus profesores registren tus evaluaciones,
                    vas a poder consultarlas desde acá.
                  </p>
                </div>
              ) : (
                <div className="groups-grid">
                  {boletines.map((boletin) => (
                    <article
                      className="group-card"
                      key={boletin.id_boletin}
                    >
                      <div className="group-card-header">
                        <span>
                          {boletin.periodo ?? "Período de evaluación"}
                        </span>
                        <span>{boletin.anio}</span>
                      </div>

                      <h3>
                        {boletin.disciplina ??
                          boletin.grupo ??
                          "Evaluación"}
                      </h3>

                      <p>
                        <strong>Profesor:</strong>{" "}
                        {boletin.nombre_profesor
                          ? `${boletin.nombre_profesor} ${
                              boletin.apellido_profesor ?? ""
                            }`
                          : boletin.profesor ?? "No informado"}
                      </p>

                      <p>
                        <strong>Fecha de evaluación:</strong>{" "}
                        {formatearFecha(boletin.fecha_evaluacion)}
                      </p>

                      <div className="student-info-grid">
                        <div>
                          <span>Período</span>
                          <strong>
                            {boletin.periodo ?? "No informado"}
                          </strong>
                        </div>

                        <div>
                          <span>Año</span>
                          <strong>{boletin.anio}</strong>
                        </div>
                      </div>

                      <div className="dashboard-card">
                        <strong>Observaciones del profesor</strong>
                        <p>
                          {boletin.observaciones?.trim() ||
                            "No se registraron observaciones."}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* =================================================
            PERSONAS AUTORIZADAS
        ================================================= */}

        {seccion === "retiros" && (
          <section className="dashboard-section">
            <div className="dashboard-card">
              <div className="card-header">
                <div>
                  <h3>Personas autorizadas</h3>
                  <p>
                    Adultos registrados que pueden retirarte de la
                    academia.
                  </p>
                </div>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => void cargarPersonasAutorizadas()}
                  disabled={loadingPersonasAutorizadas}
                >
                  {loadingPersonasAutorizadas
                    ? "Actualizando..."
                    : "Actualizar"}
                </button>
              </div>

              <div className="dashboard-warning">
                <strong>Información importante</strong>
                <p>
                  La entrega se realiza únicamente después de que
                  el profesor verifique la identidad del adulto
                  autorizado. Si algún dato es incorrecto, comunicate
                  con la administración de New Era.
                </p>
              </div>

              {loadingPersonasAutorizadas ? (
                <div className="empty-state">
                  <p>Cargando personas autorizadas...</p>
                </div>
              ) : errorPersonasAutorizadas ? (
                <div className="dashboard-warning" role="alert">
                  {errorPersonasAutorizadas}
                </div>
              ) : personasAutorizadas.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">👨‍👩‍👧</div>
                  <h3>No hay personas autorizadas</h3>
                  <p>
                    Todavía no hay adultos registrados para tu retiro.
                    Consultá con la administración.
                  </p>
                </div>
              ) : (
                <div className="groups-grid">
                  {personasAutorizadas.map((persona) => (
                    <article
                      className="group-card"
                      key={persona.id_autorizada}
                    >
                      <div className="group-card-header">
                        <span>Persona autorizada</span>
                        <span>Activa</span>
                      </div>

                      <h3>
                        {persona.nombre} {persona.apellido}
                      </h3>

                      <p>
                        <strong>DNI:</strong> {persona.dni}
                      </p>

                      <p>
                        <strong>Parentesco:</strong>{" "}
                        {persona.parentesco || "No especificado"}
                      </p>

                      <p>
                        <strong>Teléfono:</strong>{" "}
                        {persona.telefono || "No informado"}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* =================================================
            HISTORIAL DE RETIROS
        ================================================= */}

        {seccion === "historial-retiros" && (
          <section className="dashboard-section">
            <div className="dashboard-card">
              <div className="card-header">
                <div>
                  <h3>Historial de retiros</h3>
                  <p>
                    Consultá los registros de las personas que te
                    retiraron de la academia.
                  </p>
                </div>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => void cargarHistorialRetiros()}
                  disabled={loadingRetiros}
                >
                  {loadingRetiros ? "Actualizando..." : "Actualizar"}
                </button>
              </div>

              {loadingRetiros ? (
                <div className="empty-state">
                  <p>Cargando historial...</p>
                </div>
              ) : errorRetiros ? (
                <div className="dashboard-warning" role="alert">
                  {errorRetiros}
                </div>
              ) : historialRetiros.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🕒</div>
                  <h3>Sin retiros registrados</h3>
                  <p>
                    Todavía no hay registros de retiros asociados a
                    tu alumno.
                  </p>
                </div>
              ) : (
                <div className="attendance-table-wrapper">
                  <table className="attendance-table">
                    <thead>
                      <tr>
                        <th>Fecha y hora</th>
                        <th>Persona que retiró</th>
                        <th>DNI</th>
                        <th>Parentesco</th>
                        <th>Profesor</th>
                      </tr>
                    </thead>

                    <tbody>
                      {historialRetiros.map((retiro) => (
                        <tr key={retiro.id_retiro}>
                          <td>
                            {formatearFechaHora(retiro.fecha_hora)}
                          </td>

                          <td>
                            {retiro.nombre_autorizado}{" "}
                            {retiro.apellido_autorizado}
                          </td>

                          <td>{retiro.dni_autorizado}</td>

                          <td>{retiro.parentesco || "-"}</td>

                          <td>
                            {retiro.nombre_profesor}{" "}
                            {retiro.apellido_profesor}
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

        {/* =================================================
            CUOTAS
        ================================================= */}

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

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => void cargarCuotas()}
                  disabled={loadingCuotas}
                >
                  {loadingCuotas ? "Actualizando..." : "Actualizar"}
                </button>
              </div>

              {loadingCuotas ? (
                <div className="empty-state">
                  <p>Cargando cuotas...</p>
                </div>
              ) : errorCuotas ? (
                <div className="dashboard-warning" role="alert">
                  {errorCuotas}
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
                          ? montoNumerico.toLocaleString("es-AR", {
                              style: "currency",
                              currency: "ARS",
                            })
                          : "-";

                      const vencimiento = cuotaData.fecha_vencimiento
                        ? formatearFecha(
                            String(cuotaData.fecha_vencimiento)
                          )
                        : "";

                      return (
                        <div
                          className="payment-item"
                          key={idCuota ?? String(cuotaData.id_cuota)}
                        >
                          <div>
                            <strong
                              style={{ textTransform: "capitalize" }}
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

        {/* =================================================
            PERFIL
        ================================================= */}

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
