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
<<<<<<< HEAD
=======
import AdministracionDashboard from "../pages/administracion/AdministracionDashboard";
import PagoResultado from "../pages/pagos/PagoResultado";
>>>>>>> fd881ab73b9233ff5638cbcfe54526df9aea71e6

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
<<<<<<< HEAD
=======
                <Route path="/administracion" element={<AdministracionDashboard />} />
                <Route path="/pago/:estado" element={<PagoResultado />} />
>>>>>>> fd881ab73b9233ff5638cbcfe54526df9aea71e6
            </Routes>

        </BrowserRouter>

    );

}