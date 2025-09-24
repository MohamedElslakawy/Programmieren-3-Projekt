/*
  Author: Fighan Suliman
  Version: 1.0
  Datum: 24.09.2025
  
  Hauptkomponente der React-App. Enthält ThemeProvider, Dark-Mode-Logik, AuthContext und Routing.
*/

import React, { useState, useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import RouteList from "./RouteList"; // Enthält alle definierten Routen inkl. geschützte Routen
import { AuthProvider } from "./context/AuthContext"; // Globaler Auth-Context für Benutzerzustand

const App = () => {
  // Dark-Mode Zustand initial aus localStorage laden
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  // MUI-Theme erstellen basierend auf Dark/Light Mode
  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
    },
  });

  // Dark-Mode Einstellung im localStorage speichern, wenn sich der Modus ändert
  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // Funktion zum Umschalten des Dark-Modes
  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Basis-Styling von MUI */}
      <AuthProvider>
        {/* Kontext für Authentifizierung */}
        <Router>
          {/* Routen-Komponente inkl. Navbar, Footer und geschützten Routen */}
          <RouteList toggleDarkMode={toggleDarkMode} darkMode={darkMode} />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
