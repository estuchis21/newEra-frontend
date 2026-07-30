import { useState } from "react";
import "./Registro.css";

import Swal from "sweetalert2";

import { registrarAlumno } from "../../services/auth.service";

export default function Registro() {
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    email: "",
    contrasena: "",
    username: "",
    celular: "",
    id_rol: "",
    es_menor: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const {
      name,
      value,
      type,
      checked
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    try {
      await registrarAlumno({
        usuario: {
          nombre:
          form.nombre,
          apellido:
          form.apellido,
          dni:
          form.dni,
          email:
          form.email,
          contrasena:
          form.contrasena,
          username:
          form.username,
          celular:
          form.celular,
          id_rol:
          Number(form.id_rol),
        },
        es_menor:
        Number(form.id_rol) === 1
          ? form.es_menor
          : null,
      });
      Swal.fire({
        title:
        "¡Registro exitoso!",
        text:
        `Bienvenido ${form.nombre}`,
        icon:
        "success",
        confirmButtonText:
        "Aceptar",
        background:
        "#0a0a0a",
        color:
        "#ffffff",
        confirmButtonColor:
        "#9b00ff"
      });

      setForm({
        nombre:"",
        apellido:"",
        dni:"",
        email:"",
        contrasena:"",
        username:"",
        celular:"",
        id_rol:"",
        es_menor:false,

      });
    } catch(error:any) {
      console.error(error);
      Swal.fire({
        title:
        "Error",
        text:
        error.response?.data?.message ??
        "No se pudo completar el registro",
        icon:
        "error",
        confirmButtonText:
        "Aceptar",
        background:
        "#0a0a0a",
        color:
        "#ffffff",
        confirmButtonColor:
        "#9b00ff"
      });
    }
  };

  return (
    <div className="registro-container">
      <form
        className="registro-card"
        onSubmit={handleSubmit}
      >
        <h2>
          Crear cuenta
        </h2>
        <input
          name="nombre"
          placeholder="Nombre"
          value={form.nombre}
          onChange={handleChange}
          required
        />

        <input
          name="apellido"
          placeholder="Apellido"
          value={form.apellido}
          onChange={handleChange}
          required
        />

        <input
          name="dni"
          type="text"
          placeholder="DNI"
          value={form.dni}
          onChange={handleChange}
          required
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          name="username"
          placeholder="Usuario"
          value={form.username}
          onChange={handleChange}
          required
        />

        <input
          name="celular"
          placeholder="Celular"
          value={form.celular}
          onChange={handleChange}
          required
        />

        <select
          name="id_rol"
          value={form.id_rol}
          onChange={(e)=>
            setForm((prev)=>({
              ...prev,
              id_rol:e.target.value
            }))

          }
          required
        >
          <option value="">
            Seleccione tipo de usuario
          </option>
          <option value="1">
            Alumno
          </option>
          <option value="2">
            Profesor
          </option>
        </select>






        {
          Number(form.id_rol) === 1 && (


            <label className="check">


              <input

                type="checkbox"

                name="es_menor"

                checked={form.es_menor}

                onChange={handleChange}

              />


              Es menor de edad



            </label>


          )
        }







        <input

          name="contrasena"

          type="password"

          placeholder="Contraseña"

          value={form.contrasena}

          onChange={handleChange}

          required

        />







        <button

          type="submit"

        >

          Registrarse


        </button>





      </form>


    </div>

  );


}