import { useState } from "react";
import "./RecuperarPassword.css";

import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

import {
  solicitarRecuperacion,
} from "../../services/auth.service";

export default function RecuperarPassword() {

  const [email, setEmail] = useState("");
  const [cargando, setCargando] = useState(false);

  const navigate = useNavigate();

  // ============================================================
  // ENVIAR SOLICITUD DE RECUPERACIÓN
  // ============================================================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    try {

      setCargando(true);

      // ========================================================
      // LLAMAR AL BACKEND
      // ========================================================

      await solicitarRecuperacion(email);

      // ========================================================
      // MENSAJE DE ÉXITO
      // ========================================================

      await Swal.fire({
        title: "Solicitud enviada",
        text: "Si el email está registrado, recibirás un enlace para recuperar tu contraseña.",
        icon: "success",
        confirmButtonText: "Aceptar",
        background: "#0a0a0a",
        color: "#ffffff",
        confirmButtonColor: "#9b00ff",
      });

      // ========================================================
      // VOLVER AL LOGIN
      // ========================================================

      navigate("/");

    } catch (error) {

      console.error(
        "Error al solicitar recuperación:",
        error
      );

      // ========================================================
      // ERROR
      // ========================================================

      await Swal.fire({
        title: "Error",
        text: "No se pudo procesar la solicitud de recuperación.",
        icon: "error",
        confirmButtonText: "Aceptar",
        background: "#0a0a0a",
        color: "#ffffff",
        confirmButtonColor: "#9b00ff",
      });

    } finally {

      setCargando(false);

    }
  };

  return (

    <div className="recuperar-password-container">

      <form
        className="recuperar-password-card"
        onSubmit={handleSubmit}
      >

        {/* ======================================================
            TÍTULO
        ====================================================== */}

        <h2>
          Recuperar contraseña
        </h2>

        {/* ======================================================
            DESCRIPCIÓN
        ====================================================== */}

        <p className="recuperar-password-description">

          Ingresá tu email y te enviaremos un enlace
          para recuperar tu contraseña.

        </p>

        {/* ======================================================
            EMAIL
        ====================================================== */}

        <div className="input-group">

          <label>
            Email
          </label>

          <input
            type="email"
            placeholder="Ingrese su email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
            disabled={cargando}
          />

        </div>

        {/* ======================================================
            BOTÓN ENVIAR
        ====================================================== */}

        <button
          type="submit"
          disabled={cargando}
        >

          {cargando
            ? "Enviando..."
            : "Enviar enlace"}

        </button>

        {/* ======================================================
            VOLVER AL LOGIN
        ====================================================== */}

        <button
          type="button"
          className="volver-login"
          onClick={() => navigate("/")}
          disabled={cargando}
        >

          Volver al inicio de sesión

        </button>

      </form>

    </div>

  );
}
