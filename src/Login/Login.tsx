import { useState } from "react";
import "./Login.css";

import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import { login } from "../services/auth.service";

export default function Login() {
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    try {
      setLoading(true);

      const respuesta = await login({
        email,
        contrasena,
      });

      const { usuario, access_token } = respuesta;

      if (!usuario || !access_token) {
        throw new Error("Respuesta de autenticación inválida.");
      }

      // Guardamos el token
      localStorage.setItem("access_token", access_token);

      // Guardamos los datos del usuario
      localStorage.setItem(
        "usuario",
        JSON.stringify(usuario)
      );

      await Swal.fire({
        title: "¡Login exitoso!",
        text: `Bienvenido ${usuario.nombre} ${usuario.apellido}`,
        icon: "success",
        confirmButtonText: "Continuar",
        background: "#0a0a0a",
        color: "#ffffff",
        confirmButtonColor: "#9b00ff",
      });

      // Redirección según el rol
      switch (usuario.id_rol) {
        case 1:
          navigate("/administracion");
          break;

        case 2:
          navigate("/alumno");
          break;

        case 3:
          navigate("/profesor");
          break;

        default:
          localStorage.removeItem("access_token");
          localStorage.removeItem("usuario");

          await Swal.fire({
            title: "Acceso no autorizado",
            text: "El usuario no tiene un rol válido.",
            icon: "warning",
            background: "#0a0a0a",
            color: "#ffffff",
            confirmButtonColor: "#9b00ff",
          });

          break;
      }
    } catch (error) {
      console.error("Error en login:", error);

      await Swal.fire({
        title: "Error",
        text: "Email o contraseña incorrectos.",
        icon: "error",
        confirmButtonText: "Aceptar",
        background: "#0a0a0a",
        color: "#ffffff",
        confirmButtonColor: "#9b00ff",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleSubmit}>
        <h2>Iniciar Sesión</h2>

        <div className="input-group">
          <label>Email</label>

          <input
            type="email"
            placeholder="Ingrese su email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="input-group">
          <label>Contraseña</label>

          <input
            type="password"
            placeholder="Ingrese su contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Ingresando..." : "Iniciar Sesión"}
        </button>

        <button
          type="button"
          className="forgot-password"
          onClick={() => navigate("/recuperar-password")}
        >
          ¿Olvidaste tu contraseña?
        </button>
      </form>
    </div>
  );
}