import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "..//Home/Home";
import Login from "..//Login/Login";
import Registro from "../Registro/Registro";
import Clases from "../Clases/Clases";
import AlumnoDashboard from "../alumnos/AlumnoDashboard";
import ProfesoresDashboard from "../profesores/ProfesoresDashboard";
import Navbar from "../components/Navbar/Navbar";
import RecuperarPassword from "../recuperar-password/RecuperarPassword";
import ResetPassword from "../recuperar-password/ResetPassword";
import AdministracionDashboard from "../administracion/AdministracionDashboard";

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