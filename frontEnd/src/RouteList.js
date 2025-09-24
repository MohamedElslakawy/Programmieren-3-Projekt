/*
  Author: Fighan Suliman
  Version: 1.0
  Datum: 24.09.2025

  Definiert alle Routen der App, bindet Navbar, Footer und geschützte Routen ein. 
  Unterstützt Suchfunktion, Dark-Mode und öffentliche Share-Links.
*/

import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Login from "./Components/Auth/Login";
import Register from "./Components/Auth/Register";
import Home from "./Components/Home";
import EditNote from "./Components/Notes/EditNote";
import AddNote from "./Components/Notes/AddNote";
import ProtectedRoute from "./Components/ProtectedRoute";
import ForgetPassword from "./Components/Auth/ForgetPassword";
import Footer from "./Components/Footer";
import ResetPassword from "./Components/Auth/ResetPassword";
import ShareGateway from "./Components/Auth/ShareGateway"; // Für öffentliche Share-Links

const RouteList = ({ toggleDarkMode, darkMode }) => {
  const [searchTerm, setSearchTerm] = React.useState("");

  return (
    <>
      {/* Navbar mit Suchfeld und Dark-Mode-Schalter */}
      <Navbar
        toggleDarkMode={toggleDarkMode}
        darkMode={darkMode}
        setSearchTerm={setSearchTerm}
        searchTerm={searchTerm}
      />

      {/* Alle definierten App-Routen */}
      <Routes>
        {/* Startseite → zeigt Home mit Suchfunktion */}
        <Route path="/" element={<Home searchTerm={searchTerm} />} />

        {/* Authentifizierungsrouten */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgetPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Notizen → geschützte Routen */}
        <Route
          path="/add-note"
          element={
            <ProtectedRoute>
              <AddNote />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-note/:id"
          element={
            <ProtectedRoute>
              <EditNote />
            </ProtectedRoute>
          }
        />

        {/* Öffentlicher Share-Link */}
        <Route path="/share/:token" element={<ShareGateway />} />

        {/* Fallback für nicht existierende Routen */}
        <Route
          path="*"
          element={
            <div style={{ padding: 24, color: "red" }}>
              Seite nicht gefunden (404)
            </div>
          }
        />
      </Routes>

      {/* Footer global */}
      <Footer />
    </>
  );
};

export default RouteList;
