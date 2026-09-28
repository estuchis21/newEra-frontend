import "./Navbar.css";
import logo from "../../assets/logo.png";

export default function Navbar() {
    return (
        <nav className="navbar">

            {/* Barra superior */}
            <div className="top-bar">

                <div className="top-info">
                    <span>📞 +54 9 2364 123456</span>
                    <span>🕒 Lun - Vie | 08:00 - 22:00</span>
                </div>

                <div className="navbar-buttons">
                    <button className="btn-login" onClick={() => window.location.href = "/login"}>
                        Login
                    </button>

                    <button className="btn-register" onClick={() => window.location.href = "/registro"}>
                        Registro
                    </button>
                </div>

            </div>

            {/* Logo */}

            <a href="/" className="navbar-logo">
                <img src={logo} alt="Logo" />
            </a>

            {/* Menú */}

            <ul className="navbar-menu">

                <li>
                    <a href="/">Inicio</a>
                </li>

                <li>
                    <a href="/clases">Clases</a>
                </li>

                <li>
                    <a href="/contacto">Contacto</a>
                </li>

            </ul>

        </nav>
    );
}