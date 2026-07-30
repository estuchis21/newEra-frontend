import { useState } from "react";
import "./Login.css";

import Swal from "sweetalert2";

import { login } from "../../services/auth.service";


export default function Login() {

  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");


  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {

    e.preventDefault();


    try {

      const usuarioLogueado = await login({
        email,
        contrasena,
      });


      console.log(usuarioLogueado);


      Swal.fire({
        title: "¡Login exitoso!",
        text: `Bienvenido ${usuarioLogueado.nombre} ${usuarioLogueado.apellido}`,
        icon: "success",
        confirmButtonText: "Continuar",
        background: "#0a0a0a",
        color: "#ffffff",
        confirmButtonColor: "#9b00ff"
      });


      // guardar usuario si querés mantener sesión
      localStorage.setItem(
        "usuario",
        JSON.stringify(usuarioLogueado)
      );


    } catch(error) {


      console.error(error);


      Swal.fire({
        title: "Error",
        text: "Email o contraseña incorrectos.",
        icon: "error",
        confirmButtonText: "Aceptar",
        background: "#0a0a0a",
        color: "#ffffff",
        confirmButtonColor: "#9b00ff"
      });


    }

  };


  return (

    <div className="login-container">

      <form
        className="login-card"
        onSubmit={handleSubmit}
      >

        <h2>Iniciar Sesión</h2>


        <div className="input-group">

          <label>Email</label>

          <input
            type="email"
            placeholder="Ingrese su email"
            value={email}
            onChange={(e)=>
              setEmail(e.target.value)
            }
            required
          />

        </div>


        <div className="input-group">

          <label>Contraseña</label>

          <input
            type="password"
            placeholder="Ingrese su contraseña"
            value={contrasena}
            onChange={(e)=>
              setContrasena(e.target.value)
            }
            required
          />

        </div>


        <button type="submit">
          Iniciar Sesión
        </button>


      </form>

    </div>

  );
}