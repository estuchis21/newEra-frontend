import { useState } from "react";

import "./ResetPassword.css";

import Swal from "sweetalert2";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  restablecerContrasena,
} from "../../services/auth.service";


export default function ResetPassword() {

  // ==========================================================
  // ESTADOS
  // ==========================================================

  const [
    nuevaContrasena,
    setNuevaContrasena
  ] = useState("");

  const [
    confirmarContrasena,
    setConfirmarContrasena
  ] = useState("");

  const [
    cargando,
    setCargando
  ] = useState(false);


  // ==========================================================
  // NAVEGACIÓN
  // ==========================================================

  const navigate = useNavigate();


  // ==========================================================
  // OBTENER TOKEN DE LA URL
  // ==========================================================

  const [
    searchParams
  ] = useSearchParams();

  const token =
    searchParams.get("token");


  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();


    // ========================================================
    // VERIFICAR TOKEN
    // ========================================================

    if (!token) {

      await Swal.fire({
        title: "Enlace inválido",
        text: "El enlace de recuperación no contiene un token válido.",
        icon: "error",
        confirmButtonText: "Aceptar",
        background: "#0a0a0a",
        color: "#ffffff",
        confirmButtonColor: "#9b00ff",
      });

      return;
    }


    // ========================================================
    // VERIFICAR CONTRASEÑAS
    // ========================================================

    if (
      nuevaContrasena !==
      confirmarContrasena
    ) {

      await Swal.fire({
        title: "Las contraseñas no coinciden",
        text: "Verificá que ambas contraseñas sean iguales.",
        icon: "warning",
        confirmButtonText: "Aceptar",
        background: "#0a0a0a",
        color: "#ffffff",
        confirmButtonColor: "#9b00ff",
      });

      return;
    }


    // ========================================================
    // VALIDAR LONGITUD
    // ========================================================

    if (
      nuevaContrasena.length < 6
    ) {

      await Swal.fire({
        title: "Contraseña inválida",
        text: "La contraseña debe tener al menos 6 caracteres.",
        icon: "warning",
        confirmButtonText: "Aceptar",
        background: "#0a0a0a",
        color: "#ffffff",
        confirmButtonColor: "#9b00ff",
      });

      return;
    }


    try {

      setCargando(true);


      // ======================================================
      // LLAMAR AL BACKEND
      // ======================================================

      await restablecerContrasena(
        token,
        nuevaContrasena
      );


      // ======================================================
      // ÉXITO
      // ======================================================

      await Swal.fire({
        title: "¡Contraseña actualizada!",
        text: "Tu contraseña fue cambiada correctamente.",
        icon: "success",
        confirmButtonText: "Ir al login",
        background: "#0a0a0a",
        color: "#ffffff",
        confirmButtonColor: "#9b00ff",
      });


      // ======================================================
      // VOLVER AL LOGIN
      // ======================================================

      navigate("/");


    } catch (error: any) {

      console.error(
        "Error al restablecer contraseña:",
        error
      );


      // ======================================================
      // ERROR DEL BACKEND
      // ======================================================

      const mensaje =
        error?.response?.data?.message ??
        "No se pudo cambiar la contraseña.";


      await Swal.fire({
        title: "Error",
        text: Array.isArray(mensaje)
          ? mensaje.join(", ")
          : mensaje,
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


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div className="reset-password-container">

      <form
        className="reset-password-card"
        onSubmit={handleSubmit}
      >

        <h2>
          Nueva contraseña
        </h2>


        <p className="reset-password-description">

          Ingresá tu nueva contraseña
          para recuperar el acceso a tu cuenta.

        </p>


        {/* ==================================================
            NUEVA CONTRASEÑA
        ================================================== */}

        <div className="input-group">

          <label>
            Nueva contraseña
          </label>

          <input
            type="password"
            placeholder="Ingrese su nueva contraseña"
            value={nuevaContrasena}
            onChange={(e) =>
              setNuevaContrasena(
                e.target.value
              )
            }
            required
            disabled={cargando}
          />

        </div>


        {/* ==================================================
            CONFIRMAR CONTRASEÑA
        ================================================== */}

        <div className="input-group">

          <label>
            Confirmar contraseña
          </label>

          <input
            type="password"
            placeholder="Repita su nueva contraseña"
            value={confirmarContrasena}
            onChange={(e) =>
              setConfirmarContrasena(
                e.target.value
              )
            }
            required
            disabled={cargando}
          />

        </div>


        {/* ==================================================
            BOTÓN
        ================================================== */}

        <button
          type="submit"
          disabled={cargando}
        >

          {cargando
            ? "Actualizando..."
            : "Cambiar contraseña"}

        </button>


        {/* ==================================================
            VOLVER
        ================================================== */}

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
