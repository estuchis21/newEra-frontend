
import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";

import {
  obtenerLiquidacionesAdmin,
  obtenerCuentaProfesor,
  guardarCuentaProfesor,
  registrarTransferenciaAdmin,
  anularLiquidacionAdmin,
  type LiquidacionAdmin,
  type CuentaCobro,
  type RegistrarCuentaDto,
} from "../services/liquidaciones-admin.service";

const dinero = (valor: number | string | null | undefined) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(Number(valor) || 0);

const fechaHoy = () => {
  const fecha = new Date();
  fecha.setMinutes(fecha.getMinutes() - fecha.getTimezoneOffset());
  return fecha.toISOString().slice(0, 10);
};

const cuentaVacia = (): RegistrarCuentaDto => ({
  alias: "",
  cbu_cvu: "",
  titular: "",
  cuit_cuil: "",
  tipo_cuenta: "CBU",
});

export default function LiquidacionesAdmin() {
  const [liquidaciones, setLiquidaciones] = useState<LiquidacionAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("Todas");

  const [modal, setModal] = useState<"cuenta" | "transferencia" | null>(null);
  const [liquidacionSeleccionada, setLiquidacionSeleccionada] =
    useState<LiquidacionAdmin | null>(null);

  const [cuenta, setCuenta] = useState<CuentaCobro | null>(null);
  const [guardando, setGuardando] = useState(false);

  const [formCuenta, setFormCuenta] =
    useState<RegistrarCuentaDto>(cuentaVacia);

  const [formTransferencia, setFormTransferencia] = useState({
    monto_transferido: "",
    fecha_transferencia: fechaHoy(),
    id_operacion_transferencia: "",
    observaciones_transferencia: "",
  });

  const cargarLiquidaciones = async () => {
    try {
      setCargando(true);
      const datos = await obtenerLiquidacionesAdmin();
      setLiquidaciones(Array.isArray(datos) ? datos : []);
    } catch (error: any) {
      console.error(error);
      Swal.fire(
        "Error",
        error.response?.data?.message ||
          "No se pudieron cargar las liquidaciones.",
        "error",
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargarLiquidaciones();
  }, []);

  const filtradas = useMemo(() => {
    return liquidaciones.filter((item) => {
      const nombre =
        `${item.nombre_profesor || ""} ${item.apellido_profesor || ""}`
          .toLowerCase();

      const termino = busqueda.trim().toLowerCase();

      const coincideBusqueda =
        nombre.includes(termino) ||
        String(item.id_liquidacion).includes(termino) ||
        String(item.id_cuota).includes(termino);

      const coincideEstado =
        filtro === "Todas" || item.estado === filtro;

      return coincideBusqueda && coincideEstado;
    });
  }, [liquidaciones, busqueda, filtro]);

  const totalPendiente = liquidaciones
    .filter((l) => l.estado === "Pendiente")
    .reduce((total, l) => total + Number(l.monto_profesor), 0);

  const totalPagado = liquidaciones
    .filter((l) => l.estado === "Pagado")
    .reduce((total, l) => total + Number(l.monto_profesor), 0);

  const totalAcademia = liquidaciones
    .filter((l) => l.estado !== "Anulado")
    .reduce((total, l) => total + Number(l.monto_academia), 0);

  const abrirCuenta = async (item: LiquidacionAdmin) => {
    setLiquidacionSeleccionada(item);
    setCuenta(null);
    setFormCuenta(cuentaVacia());
    setModal("cuenta");

    try {
      const datos = await obtenerCuentaProfesor(item.id_profesor);

      if (datos) {
        setCuenta(datos);

        setFormCuenta({
          alias: datos.alias ?? "",
          cbu_cvu: datos.cbu_cvu ?? "",
          titular: datos.titular ?? "",
          cuit_cuil: datos.cuit_cuil ?? "",
          tipo_cuenta: datos.tipo_cuenta,
        });
      }
    } catch (error: any) {
      Swal.fire(
        "Error",
        error.response?.data?.message ||
          "No se pudo consultar la cuenta del profesor.",
        "error",
      );
    }
  };

  const guardarCuenta = async () => {
    if (!liquidacionSeleccionada) return;

    const alias = (formCuenta.alias ?? "").trim();
    const cbuCvu = (formCuenta.cbu_cvu ?? "").trim();
    const titular = (formCuenta.titular ?? "").trim();
    const cuitCuil = (formCuenta.cuit_cuil ?? "").trim();

    if (!alias && !cbuCvu) {
      Swal.fire("Atención", "Ingresá un alias o CBU/CVU.", "warning");
      return;
    }

    if (cbuCvu && !/^\d{22}$/.test(cbuCvu)) {
      Swal.fire(
        "Atención",
        "El CBU/CVU debe tener exactamente 22 dígitos.",
        "warning",
      );
      return;
    }

    if (!titular) {
      Swal.fire("Atención", "El titular es obligatorio.", "warning");
      return;
    }

    try {
      setGuardando(true);

      await guardarCuentaProfesor(
        liquidacionSeleccionada.id_profesor,
        {
          ...formCuenta,
          alias: alias || undefined,
          cbu_cvu: cbuCvu || undefined,
          titular,
          cuit_cuil: cuitCuil || undefined,
        },
      );

      setModal(null);

      await Swal.fire(
        "Cuenta guardada",
        "La cuenta de cobro del profesor fue registrada correctamente.",
        "success",
      );
    } catch (error: any) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "No se pudo guardar la cuenta.",
        "error",
      );
    } finally {
      setGuardando(false);
    }
  };

  const abrirTransferencia = async (item: LiquidacionAdmin) => {
    setLiquidacionSeleccionada(item);
    setCuenta(null);

    setFormTransferencia({
      monto_transferido: Number(item.monto_profesor).toFixed(2),
      fecha_transferencia: fechaHoy(),
      id_operacion_transferencia: "",
      observaciones_transferencia: "",
    });

    setModal("transferencia");

    try {
      const datos = await obtenerCuentaProfesor(item.id_profesor);
      setCuenta(datos ?? null);
    } catch (error: any) {
      Swal.fire(
        "Error",
        error.response?.data?.message ||
          "No se pudo consultar la cuenta de cobro.",
        "error",
      );
    }
  };

  const confirmarTransferencia = async () => {
    if (!liquidacionSeleccionada) return;

    if (!cuenta?.id_cuenta) {
      Swal.fire(
        "Cuenta requerida",
        "El profesor necesita una cuenta de cobro activa.",
        "warning",
      );
      return;
    }

    const monto = Number(formTransferencia.monto_transferido);
    const esperado = Number(liquidacionSeleccionada.monto_profesor);

    if (!Number.isFinite(monto) || monto <= 0) {
      Swal.fire("Atención", "Ingresá un monto válido.", "warning");
      return;
    }

    if (Math.abs(monto - esperado) > 0.01) {
      Swal.fire(
        "Monto incorrecto",
        `El importe debe ser ${dinero(esperado)}.`,
        "warning",
      );
      return;
    }

    if (!formTransferencia.fecha_transferencia) {
      Swal.fire("Atención", "Ingresá la fecha de transferencia.", "warning");
      return;
    }

    const confirmacion = await Swal.fire({
      title: "¿Registrar transferencia?",
      html: `
        <p>Profesor: <strong>${liquidacionSeleccionada.nombre_profesor || ""} ${liquidacionSeleccionada.apellido_profesor || ""}</strong></p>
        <p>Importe: <strong>${dinero(monto)}</strong></p>
        <p>Destino: <strong>${cuenta.titular}</strong></p>
        <p>Alias: <strong>${cuenta.alias || "No informado"}</strong></p>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Confirmar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) return;

    try {
      setGuardando(true);

      await registrarTransferenciaAdmin(
        liquidacionSeleccionada.id_liquidacion,
        {
          monto_transferido: monto,
          fecha_transferencia: formTransferencia.fecha_transferencia,
          id_cuenta: cuenta.id_cuenta,
          id_operacion_transferencia:
            formTransferencia.id_operacion_transferencia.trim() || undefined,
          observaciones_transferencia:
            formTransferencia.observaciones_transferencia.trim() || undefined,
        },
      );

      setModal(null);

      await Swal.fire(
        "Transferencia registrada",
        "La liquidación fue marcada como pagada.",
        "success",
      );

      await cargarLiquidaciones();
    } catch (error: any) {
      Swal.fire(
        "Error",
        error.response?.data?.message ||
          "No se pudo registrar la transferencia.",
        "error",
      );
    } finally {
      setGuardando(false);
    }
  };

  const anular = async (item: LiquidacionAdmin) => {
    const confirmacion = await Swal.fire({
      title: "¿Anular liquidación?",
      text: `Se anulará la liquidación #${item.id_liquidacion}.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, anular",
      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) return;

    try {
      await anularLiquidacionAdmin(item.id_liquidacion);

      await Swal.fire(
        "Liquidación anulada",
        "La operación se realizó correctamente.",
        "success",
      );

      await cargarLiquidaciones();
    } catch (error: any) {
      Swal.fire(
        "Error",
        error.response?.data?.message ||
          "No se pudo anular la liquidación.",
        "error",
      );
    }
  };

  return (
    <section className="admin-card la-container">
      <style>{`
        .la-container { min-width:0; }
        .la-stats {
          display:grid;
          grid-template-columns:repeat(auto-fit,minmax(170px,1fr));
          gap:14px;
          margin-bottom:22px;
        }
        .la-stat {
          padding:16px;
          border:1px solid #e5e7eb;
          border-radius:10px;
          background:#fff;
        }
        .la-stat span { display:block;color:#6b7280;font-size:13px; }
        .la-stat strong { display:block;margin-top:8px;font-size:21px; }
        .la-toolbar {
          display:flex;gap:10px;flex-wrap:wrap;margin-bottom:16px;
        }
        .la-toolbar input,.la-toolbar select,.la-modal input,
        .la-modal select,.la-modal textarea {
          border:1px solid #d1d5db;border-radius:8px;padding:10px;
          font:inherit;box-sizing:border-box;width:100%;
        }
        .la-toolbar input { max-width:340px; }
        .la-toolbar select { max-width:190px; }
        .la-table-wrap { overflow-x:auto; }
        .la-table { width:100%;min-width:950px;border-collapse:collapse;font-size:13px; }
        .la-table th,.la-table td { padding:12px;border-bottom:1px solid #e5e7eb;text-align:left; }
        .la-table th { background:#f9fafb;color:#6b7280; }
        .la-pill { padding:5px 9px;border-radius:20px;font-size:11px;font-weight:700; }
        .la-pendiente { background:#fef3c7;color:#92400e; }
        .la-pagado { background:#dcfce7;color:#166534; }
        .la-anulado { background:#fee2e2;color:#991b1b; }
        .la-btn { border:0;border-radius:7px;padding:8px 10px;cursor:pointer;font-weight:600;font-size:12px;margin:2px; }
        .la-btn:disabled { opacity:.55;cursor:not-allowed; }
        .la-blue { background:#dbeafe;color:#1d4ed8; }
        .la-green { background:#dcfce7;color:#166534; }
        .la-red { background:#fee2e2;color:#991b1b; }
        .la-modal-bg {
          position:fixed;inset:0;background:#0008;z-index:9999;
          display:flex;align-items:center;justify-content:center;padding:16px;
        }
        .la-modal {
          width:100%;max-width:520px;max-height:90vh;overflow:auto;
          background:white;border-radius:12px;padding:22px;
        }
        .la-modal h3 { margin-top:0; }
        .la-field { margin:13px 0; }
        .la-field label { display:block;font-size:13px;font-weight:650;margin-bottom:6px; }
        .la-modal-actions { display:flex;justify-content:flex-end;gap:8px;margin-top:20px; }
        .la-destino { padding:12px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;font-size:13px;margin:12px 0;overflow-wrap:anywhere; }
      `}</style>

      <div className="la-stats">
        <div className="la-stat">
          <span>Liquidaciones</span>
          <strong>{liquidaciones.length}</strong>
        </div>
        <div className="la-stat">
          <span>Pendiente de transferir</span>
          <strong>{dinero(totalPendiente)}</strong>
        </div>
        <div className="la-stat">
          <span>Transferido a profesores</span>
          <strong>{dinero(totalPagado)}</strong>
        </div>
        <div className="la-stat">
          <span>Participación de la academia</span>
          <strong>{dinero(totalAcademia)}</strong>
        </div>
      </div>

      <div className="la-toolbar">
        <input
          placeholder="Buscar profesor, cuota o liquidación..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
          <option value="Todas">Todos los estados</option>
          <option value="Pendiente">Pendientes</option>
          <option value="Pagado">Pagadas</option>
          <option value="Anulado">Anuladas</option>
        </select>

        <button
          className="la-btn la-blue"
          onClick={() => void cargarLiquidaciones()}
          disabled={cargando}
        >
          {cargando ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      <div className="la-table-wrap">
        {cargando ? (
          <p className="admin-empty">Cargando liquidaciones...</p>
        ) : filtradas.length === 0 ? (
          <p className="admin-empty">No hay liquidaciones para mostrar.</p>
        ) : (
          <table className="la-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Profesor</th>
                <th>Cuota</th>
                <th>Período</th>
                <th>Base</th>
                <th>Profesor</th>
                <th>Academia</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filtradas.map((item) => (
                <tr key={item.id_liquidacion}>
                  <td>#{item.id_liquidacion}</td>
                  <td>
                    {item.nombre_profesor || "Profesor"}{" "}
                    {item.apellido_profesor || ""}
                  </td>
                  <td>{item.id_cuota}</td>
                  <td>{item.mes_anio || "—"}</td>
                  <td>{dinero(item.monto_base)}</td>
                  <td><strong>{dinero(item.monto_profesor)}</strong></td>
                  <td>{dinero(item.monto_academia)}</td>
                  <td>
                    <span
                      className={`la-pill la-${item.estado.toLowerCase()}`}
                    >
                      {item.estado}
                    </span>
                  </td>
                  <td>
                    <button
                      className="la-btn la-blue"
                      onClick={() => void abrirCuenta(item)}
                    >
                      Cuenta
                    </button>

                    {item.estado === "Pendiente" && (
                      <>
                        <button
                          className="la-btn la-green"
                          onClick={() => void abrirTransferencia(item)}
                        >
                          Pagar
                        </button>
                        <button
                          className="la-btn la-red"
                          onClick={() => void anular(item)}
                        >
                          Anular
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div
          className="la-modal-bg"
          onClick={(e) => {
            if (e.target === e.currentTarget && !guardando) setModal(null);
          }}
        >
          <div className="la-modal">
            {modal === "cuenta" && (
              <>
                <h3>Cuenta de cobro del profesor</h3>

                {cuenta && (
                  <div className="la-destino">
                    <strong>Cuenta actualmente registrada</strong>
                    <p>Titular: {cuenta.titular}</p>
                    <p>Tipo: {cuenta.tipo_cuenta}</p>
                    {cuenta.alias && <p>Alias: {cuenta.alias}</p>}
                    {cuenta.cbu_cvu && <p>CBU/CVU: {cuenta.cbu_cvu}</p>}
                  </div>
                )}

                <div className="la-field">
                  <label>Alias</label>
                  <input
                    value={formCuenta.alias ?? ""}
                    onChange={(e) =>
                      setFormCuenta({ ...formCuenta, alias: e.target.value })
                    }
                  />
                </div>

                <div className="la-field">
                  <label>CBU/CVU (22 dígitos)</label>
                  <input
                    maxLength={22}
                    value={formCuenta.cbu_cvu ?? ""}
                    onChange={(e) =>
                      setFormCuenta({
                        ...formCuenta,
                        cbu_cvu: e.target.value.replace(/\D/g, ""),
                      })
                    }
                  />
                </div>

                <div className="la-field">
                  <label>Titular</label>
                  <input
                    value={formCuenta.titular ?? ""}
                    onChange={(e) =>
                      setFormCuenta({ ...formCuenta, titular: e.target.value })
                    }
                  />
                </div>

                <div className="la-field">
                  <label>CUIT/CUIL</label>
                  <input
                    value={formCuenta.cuit_cuil ?? ""}
                    onChange={(e) =>
                      setFormCuenta({
                        ...formCuenta,
                        cuit_cuil: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="la-field">
                  <label>Tipo de cuenta</label>
                  <select
                    value={formCuenta.tipo_cuenta}
                    onChange={(e) =>
                      setFormCuenta({
                        ...formCuenta,
                        tipo_cuenta: e.target.value as "CBU" | "CVU",
                      })
                    }
                  >
                    <option value="CBU">CBU - Cuenta bancaria</option>
                    <option value="CVU">CVU - Billetera virtual</option>
                  </select>
                </div>

                <div className="la-modal-actions">
                  <button
                    className="la-btn la-blue"
                    disabled={guardando}
                    onClick={() => setModal(null)}
                  >
                    Cerrar
                  </button>
                  <button
                    className="la-btn la-green"
                    disabled={guardando}
                    onClick={() => void guardarCuenta()}
                  >
                    {guardando ? "Guardando..." : "Guardar cuenta"}
                  </button>
                </div>
              </>
            )}

            {modal === "transferencia" && liquidacionSeleccionada && (
              <>
                <h3>Registrar transferencia</h3>

                <p>
                  Profesor:{" "}
                  <strong>
                    {liquidacionSeleccionada.nombre_profesor}{" "}
                    {liquidacionSeleccionada.apellido_profesor}
                  </strong>
                </p>

                <div className="la-destino">
                  <strong>Importe a transferir</strong>
                  <h2>{dinero(liquidacionSeleccionada.monto_profesor)}</h2>
                  {cuenta ? (
                    <>
                      <p>Titular: {cuenta.titular}</p>
                      <p>Tipo: {cuenta.tipo_cuenta}</p>
                      {cuenta.alias && <p>Alias: {cuenta.alias}</p>}
                      {cuenta.cbu_cvu && <p>CBU/CVU: {cuenta.cbu_cvu}</p>}
                    </>
                  ) : (
                    <p>No se encontró una cuenta activa para este profesor.</p>
                  )}
                </div>

                <div className="la-field">
                  <label>Importe transferido</label>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formTransferencia.monto_transferido}
                    onChange={(e) =>
                      setFormTransferencia({
                        ...formTransferencia,
                        monto_transferido: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="la-field">
                  <label>Fecha de transferencia</label>
                  <input
                    type="date"
                    value={formTransferencia.fecha_transferencia}
                    onChange={(e) =>
                      setFormTransferencia({
                        ...formTransferencia,
                        fecha_transferencia: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="la-field">
                  <label>ID de operación / comprobante</label>
                  <input
                    value={formTransferencia.id_operacion_transferencia}
                    onChange={(e) =>
                      setFormTransferencia({
                        ...formTransferencia,
                        id_operacion_transferencia: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="la-field">
                  <label>Observaciones</label>
                  <textarea
                    rows={3}
                    value={formTransferencia.observaciones_transferencia}
                    onChange={(e) =>
                      setFormTransferencia({
                        ...formTransferencia,
                        observaciones_transferencia: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="la-modal-actions">
                  <button
                    className="la-btn la-blue"
                    disabled={guardando}
                    onClick={() => setModal(null)}
                  >
                    Cancelar
                  </button>
                  <button
                    className="la-btn la-green"
                    disabled={guardando || !cuenta?.id_cuenta}
                    onClick={() => void confirmarTransferencia()}
                  >
                    {guardando ? "Registrando..." : "Confirmar pago"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
