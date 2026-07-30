import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home/Home";
import Login from "../pages/Login/Login";
import Registro from "../pages/Registro/Registro";
import Clases from "../pages/Clases/Clases";

import Navbar from "../components/Navbar/Navbar";

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

            </Routes>

        </BrowserRouter>

    );

}