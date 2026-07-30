import "./Navbar.css";
export default function Navbar() {
    return (
        <nav className="navbar">
            <a className="navbar-logo">
                New Era
            </a>
            <ul className="navbar-menu">
                <li>
                    <a href="/">
                        Inicio
                    </a>
                </li>
                <li>
                    <a href="/clases">
                        Clases
                    </a>
                </li>
                <li>
                    <a href="/">
                        Historia
                    </a>
                </li>
                <li>
                    <a href="/contacto">
                        Contacto
                    </a>
                </li>
            </ul>
            <div className="navbar-buttons">
                <button className="btn-login">
                    Login
                </button>
                <button className="btn-register">
                    Registro
                </button>
            </div>
        </nav>
    );
}