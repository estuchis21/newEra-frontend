import { useState } from "react";
import "./Registro.css";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { registrarAlumno } from "../../services/auth.service";

export default function Registro() {

    const navigate = useNavigate();

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
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement
        >
    ) => {

        const {
            name,
            value,
            type,
        } = e.target;

        const checked =
            e.target instanceof HTMLInputElement
                ? e.target.checked
                : false;

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

            const rol = Number(form.id_rol);

            console.log(
                "================================="
            );

            console.log(
                "ROL SELECCIONADO:",
                rol
            );

            console.log(
                "FORMULARIO:",
                form
            );

            const datos = {
                usuario: {
                    nombre: form.nombre,
                    apellido: form.apellido,
                    dni: form.dni,
                    email: form.email,
                    contrasena: form.contrasena,
                    username: form.username,
                    celular: form.celular,
                    id_rol: rol,
                },

                es_menor:
                    rol === 2
                        ? form.es_menor
                        : null,
            };

            console.log(
                "DATOS ENVIADOS AL BACKEND:",
                datos
            );

            console.log(
                "ID_ROL ENVIADO:",
                datos.usuario.id_rol
            );

            const usuarioRegistrado =
                await registrarAlumno(datos);

            console.log(
                "RESPUESTA DEL BACKEND:",
                usuarioRegistrado
            );

            console.log(
                "ID_USUARIO DEVUELTO:",
                usuarioRegistrado?.id_usuario
            );

            console.log(
                "ID_ROL DEVUELTO:",
                usuarioRegistrado?.id_rol
            );

            // Verificar que realmente haya ID
            if (!usuarioRegistrado?.id_usuario) {

                throw new Error(
                    "El backend no devolvió id_usuario"
                );
            }

            // Verificar que el backend respetó el rol
            if (
                Number(usuarioRegistrado.id_rol)
                !== rol
            ) {

                throw new Error(
                    `El backend devolvió id_rol ${usuarioRegistrado.id_rol} pero se esperaba ${rol}`
                );
            }

            // Guardar usuario COMPLETO
            localStorage.setItem(
                "usuario",
                JSON.stringify(
                    usuarioRegistrado
                )
            );

            console.log(
                "USUARIO GUARDADO EN LOCALSTORAGE:",
                JSON.parse(
                    localStorage.getItem("usuario")!
                )
            );

            await Swal.fire({
                title: "¡Registro exitoso!",
                text: `Bienvenido ${form.nombre}`,
                icon: "success",
                confirmButtonText: "Continuar",
                background: "#0a0a0a",
                color: "#ffffff",
                confirmButtonColor: "#9b00ff",
            });

            setForm({
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

            if (rol === 2) {

                navigate("/alumno");

            } else if (rol === 3) {

                navigate("/profesor");

            } else {

                navigate("/");

            }

        } catch (error: any) {

            console.error(
                "ERROR AL REGISTRAR:",
                error
            );

            Swal.fire({
                title: "Error",
                text:
                    error.response?.data?.message
                    ??
                    error.message
                    ??
                    "No se pudo completar el registro",
                icon: "error",
                confirmButtonText: "Aceptar",
                background: "#0a0a0a",
                color: "#ffffff",
                confirmButtonColor: "#9b00ff",
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
                    autoComplete="given-name"
                    required
                />

                <input
                    name="apellido"
                    placeholder="Apellido"
                    value={form.apellido}
                    onChange={handleChange}
                    autoComplete="family-name"
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
                    autoComplete="email"
                    required
                />

                <input
                    name="username"
                    placeholder="Usuario"
                    value={form.username}
                    onChange={handleChange}
                    autoComplete="username"
                    required
                />

                <input
                    name="celular"
                    placeholder="Celular"
                    value={form.celular}
                    onChange={handleChange}
                    autoComplete="tel"
                    required
                />

                <select
                    name="id_rol"
                    value={form.id_rol}
                    onChange={handleChange}
                    required
                >

                    <option value="">
                        Seleccione tipo de usuario
                    </option>

                    <option value="2">
                        Alumno
                    </option>

                    <option value="3">
                        Profesor
                    </option>

                </select>

                {Number(form.id_rol) === 2 && (

                    <label className="check">

                        <input
                            type="checkbox"
                            name="es_menor"
                            checked={form.es_menor}
                            onChange={handleChange}
                        />

                        Es menor de edad

                    </label>
                )}

                <input
                    name="contrasena"
                    type="password"
                    placeholder="Contraseña"
                    value={form.contrasena}
                    onChange={handleChange}
                    autoComplete="new-password"
                    required
                />

                <button type="submit">
                    Registrarse
                </button>

            </form>

        </div>
    );
}