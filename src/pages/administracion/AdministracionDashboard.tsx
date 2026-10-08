import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  obtenerAlumnosAdmin,
  obtenerCuotasPendientesAdmin,
  obtenerDashboardAdmin,
  obtenerGruposAdmin,
  obtenerPagosRecientesAdmin,
  type AdminDashboard,
} from "../../services/administracion.service";
import "./AdministracionDashboard.css";

type Seccion = "inicio" | "alumnos" | "grupos" | "cuotas" | "pagos";

const dinero = (valor: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(Number(valor) || 0);

export default function AdministracionDashboard() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState<any>(null);
  const [seccion, setSeccion] = useState<Seccion>("inicio");
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [grupos, setGrupos] = useState<any[]>([]);
  const [cuotas, setCuotas] = useState<any[]>([]);
  const [pagos, setPagos] = useState<any[]>([]);
  const [buscar, setBuscar] = useState("");
  const [cargando, setCargando] = useState(true);

  const idUsuario = Number(usuario?.id_usuario);

  const cargar = async () => {
    if (!Number.isInteger(idUsuario) || idUsuario <= 0) return;

    try {
      setCargando(true);
      const [d, a, g, c, p] = await Promise.all([
        obtenerDashboardAdmin(idUsuario),
        obtenerAlumnosAdmin(idUsuario),
        obtenerGruposAdmin(idUsuario),
        obtenerCuotasPendientesAdmin(idUsuario),
        obtenerPagosRecientesAdmin(idUsuario),
      ]);

      setDashboard(d);
      setAlumnos(Array.isArray(a) ? a : []);
      setGrupos(Array.isArray(g) ? g : []);
      setCuotas(Array.isArray(c) ? c : []);
      setPagos(Array.isArray(p) ? p : []);
    } catch (error) {
      console.error(error);
      await Swal.fire({
        icon: "error",
        title: "Acceso denegado",
        text: "No se pudo cargar el panel administrativo.",
        confirmButtonText: "Volver",
      });
      navigate("/");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    const guardado = localStorage.getItem("usuario");

    if (!guardado) {
      navigate("/login");
      return;
    }

    try {
      const parsed = JSON.parse(guardado);
      setUsuario(parsed);

      if (Number(parsed.id_rol) !== 1) {
        navigate("/");
      }
    } catch {
      localStorage.removeItem("usuario");
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (idUsuario) cargar();
  }, [idUsuario]);

  const alumnosFiltrados = useMemo(() => {
    const termino = buscar.trim().toLowerCase();
    if (!termino) return alumnos;

    return alumnos.filter((alumno) =>
      `${alumno.nombre} ${alumno.apellido} ${alumno.email} ${alumno.dni ?? ""}`
        .toLowerCase()
        .includes(termino),
    );
  }, [alumnos, buscar]);

  const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (cargando && !dashboard) {
    return <div className="admin-loading">Cargando panel administrativo...</div>;
  }

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div>
          <span className="admin-kicker">NEW ERA ACADEMY</span>
          <h1>Administración</h1>
          <p>{usuario?.nombre} {usuario?.apellido}</p>
        </div>

        <nav>
          {[
            ["inicio", "Resumen"],
            ["alumnos", "Alumnos"],
            ["grupos", "Grupos"],
            ["cuotas", "Cuotas"],
            ["pagos", "Pagos"],
          ].map(([key, label]) => (
            <button
              key={key}
              className={seccion === key ? "active" : ""}
              onClick={() => setSeccion(key as Seccion)}
            >
              {label}
            </button>
          ))}
        </nav>

        <button className="admin-logout" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <span className="admin-kicker">PANEL DE CONTROL</span>
            <h2>
              {seccion === "inicio" && "Resumen general"}
              {seccion === "alumnos" && "Alumnos"}
              {seccion === "grupos" && "Grupos"}
              {seccion === "cuotas" && "Cuotas pendientes"}
              {seccion === "pagos" && "Pagos recientes"}
            </h2>
          </div>
          <button className="admin-refresh" onClick={cargar}>
            Actualizar
          </button>
        </header>

        {seccion === "inicio" && dashboard && (
          <>
            <section className="admin-stats">
              <article><span>Alumnos</span><strong>{dashboard.alumnos}</strong></article>
              <article><span>Profesores</span><strong>{dashboard.profesores}</strong></article>
              <article><span>Grupos activos</span><strong>{dashboard.grupos}</strong></article>
              <article><span>Clases hoy</span><strong>{dashboard.clasesHoy}</strong></article>
              <article><span>Cuotas pendientes</span><strong>{dashboard.cuotasPendientes}</strong></article>
              <article><span>Deuda registrada</span><strong>{dinero(dashboard.montoPendiente)}</strong></article>
              <article><span>Pagos aprobados</span><strong>{dashboard.pagosAprobados}</strong></article>
              <article><span>Ingresos registrados</span><strong>{dinero(dashboard.ingresos)}</strong></article>
            </section>

            <section className="admin-grid-two">
              <div className="admin-card">
                <span className="admin-kicker">ASISTENCIA</span>
                <h3>Asistencia acumulada</h3>
                <div className="admin-progress-row">
                  <span>Presentes</span>
                  <strong>{dashboard.asistencia.presentes}</strong>
                </div>
                <div className="admin-progress-row">
                  <span>Ausentes</span>
                  <strong>{dashboard.asistencia.ausentes}</strong>
                </div>
              </div>

              <div className="admin-card">
                <span className="admin-kicker">OPERACIÓN</span>
                <h3>Acciones rápidas</h3>
                <div className="admin-actions">
                  <button onClick={() => setSeccion("alumnos")}>Buscar alumno</button>
                  <button onClick={() => setSeccion("grupos")}>Ver ocupación</button>
                  <button onClick={() => setSeccion("cuotas")}>Revisar deuda</button>
                  <button onClick={() => setSeccion("pagos")}>Ver pagos</button>
                </div>
              </div>
            </section>
          </>
        )}

        {seccion === "alumnos" && (
          <section className="admin-card">
            <div className="admin-toolbar">
              <input
                value={buscar}
                onChange={(e) => setBuscar(e.target.value)}
                placeholder="Buscar por nombre, email o DNI..."
              />
            </div>
            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Alumno</th>
                    <th>Email</th>
                    <th>DNI</th>
                    <th>Grupos</th>
                    <th>Créditos aprox.</th>
                  </tr>
                </thead>
                <tbody>
                  {alumnosFiltrados.map((alumno) => (
                    <tr key={alumno.id_alumno}>
                      <td>{alumno.nombre} {alumno.apellido}</td>
                      <td>{alumno.email}</td>
                      <td>{alumno.dni || "-"}</td>
                      <td>{alumno.grupos_activos}</td>
                      <td>{alumno.creditos_aprox}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {alumnosFiltrados.length === 0 && <p className="admin-empty">No hay alumnos para mostrar.</p>}
            </div>
          </section>
        )}

        {seccion === "grupos" && (
          <section className="admin-card">
            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Disciplina</th>
                    <th>Nivel</th>
                    <th>Profesor</th>
                    <th>Ocupación</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {grupos.map((grupo) => (
                    <tr key={grupo.id_grupo}>
                      <td>{grupo.disciplina}</td>
                      <td>{grupo.nivel}</td>
                      <td>{grupo.profesor}</td>
                      <td>{grupo.alumnos} / {grupo.cupo_max}</td>
                      <td>{grupo.activo ? "Activo" : "Inactivo"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {seccion === "cuotas" && (
          <section className="admin-card">
            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Alumno</th>
                    <th>Período</th>
                    <th>Vencimiento</th>
                    <th>Monto</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {cuotas.map((cuota) => (
                    <tr key={cuota.id_cuota}>
                      <td>{cuota.nombre} {cuota.apellido}</td>
                      <td>{cuota.mes_anio}</td>
                      <td>{new Date(cuota.vencimiento).toLocaleDateString("es-AR")}</td>
                      <td>{dinero(cuota.monto)}</td>
                      <td><span className="admin-badge pending">{cuota.estado}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {cuotas.length === 0 && <p className="admin-empty">No hay cuotas pendientes.</p>}
            </div>
          </section>
        )}

        {seccion === "pagos" && (
          <section className="admin-card">
            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Alumno</th>
                    <th>Monto</th>
                    <th>Fecha</th>
                    <th>Método</th>
                    <th>Mercado Pago</th>
                  </tr>
                </thead>
                <tbody>
                  {pagos.map((pago) => (
                    <tr key={pago.id_pago}>
                      <td>{pago.nombre} {pago.apellido}</td>
                      <td>{dinero(pago.monto)}</td>
                      <td>{pago.fecha_pago ? new Date(pago.fecha_pago).toLocaleString("es-AR") : "-"}</td>
                      <td>{pago.metodo_pago || "-"}</td>
                      <td>{pago.id_mercado_pago || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {pagos.length === 0 && <p className="admin-empty">Todavía no hay pagos registrados.</p>}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
