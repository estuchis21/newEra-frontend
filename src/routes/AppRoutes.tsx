import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Registro from "../pages/Registro/Registro";
import Clases from "../pages/Clases/Clases";
import AlumnoDashboard from "../pages/alumnos/AlumnoDashboard";
import ProfesoresDashboard from "../pages/profesores/ProfesoresDashboard";
import Navbar from "../components/Navbar/Navbar";
import RecuperarPassword from "../pages/recuperar-password/RecuperarPassword";
import ResetPassword from "../pages/recuperar-password/ResetPassword";
import AdministracionDashboard from "../pages/administracion/AdministracionDashboard";

export default function AppRoutes() {

    return (

        <BrowserRouter>

            <Navbar />

            <Routes>

                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/clases"
                    element={<Clases />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/registro"
                    element={<Registro />}
                />

                <Route
                    path="/alumno"
                    element={<AlumnoDashboard />}
                />

                <Route 
                    path="/profesor"
                    element={<ProfesoresDashboard />}
                />
                <Route path="/recuperar-password" element={<RecuperarPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route
                    path="/administracion"
                    element={<AdministracionDashboard />}
                />
            </Routes>

        </BrowserRouter>

    );

}