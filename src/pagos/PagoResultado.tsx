import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import "./PagoResultado.css";

export default function PagoResultado() {
  const { estado } = useParams<{ estado: string }>();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const configuracion = {
    exitoso: {
      titulo: "Pago aprobado",
      mensaje: "Mercado Pago informó que el pago fue aprobado. La acreditación definitiva se realiza mediante el webhook del backend.",
      icono: "✓",
    },
    fallido: {
      titulo: "Pago rechazado",
      mensaje: "El pago no pudo completarse. Podés volver a tus cuotas e intentarlo nuevamente.",
      icono: "!",
    },
    pendiente: {
      titulo: "Pago pendiente",
      mensaje: "El pago quedó pendiente. No vuelvas a pagar hasta comprobar su estado en tu cuenta.",
      icono: "…",
    },
  } as const;

  const actual =
    configuracion[estado as keyof typeof configuracion] ??
    configuracion.pendiente;

  return (
    <main className="pago-resultado">
      <section className="pago-resultado-card">
        <div className="pago-resultado-icon">{actual.icono}</div>
        <span className="pago-resultado-kicker">NEW ERA ACADEMY</span>
        <h1>{actual.titulo}</h1>
        <p>{actual.mensaje}</p>

        {params.get("payment_id") && (
          <div className="pago-resultado-detail">
            <span>ID de operación</span>
            <strong>{params.get("payment_id")}</strong>
          </div>
        )}

        {params.get("status") && (
          <div className="pago-resultado-detail">
            <span>Estado informado</span>
            <strong>{params.get("status")}</strong>
          </div>
        )}

        <button onClick={() => navigate("/alumno")}>
          Volver a mi cuenta
        </button>
      </section>
    </main>
  );
}
