import ProfesorDashboard from "./ProfesoresDashboard";

export default function ProfesorPage() {

    const usuarioGuardado = localStorage.getItem("usuario");

    console.log("=================================");
    console.log("LOCAL STORAGE:", usuarioGuardado);

    // No hay usuario
    if (!usuarioGuardado) {
        return (
            <div>
                <h1>No hay usuario registrado</h1>
            </div>
        );
    }

    let usuario: any;

    try {
        usuario = JSON.parse(usuarioGuardado);
    } catch (error) {
        console.error("ERROR PARSEANDO USUARIO:", error);
        return (
            <div>
                <h1>Datos de usuario inválidos</h1>
            </div>
        );
    }

    console.log("USUARIO PARSEADO:", usuario);
    console.log("ID USUARIO:", usuario.id_usuario);
    console.log("ID ROL:", usuario.id_rol);

    const idUsuario = Number(usuario.id_usuario);

    // Validar ID
    if (!idUsuario || Number.isNaN(idUsuario)) {
        return (
            <div>
                <h1>ID de usuario inválido</h1>
                <p>No se pudo obtener el ID del usuario.</p>
            </div>
        );
    }

    // Validar rol
    if (Number(usuario.id_rol) !== 3) {
        return (
            <div>
                <h1>Acceso no autorizado</h1>
                <p>El usuario no es profesor.</p>
            </div>
        );
    }

    return <ProfesorDashboard />;
}