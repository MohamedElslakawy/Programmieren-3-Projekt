/*
  Author: Fighan Suliman
  Version: 1.0
  Datum: 24.09.2025

  Entry-Point der App. Initialisiert ReactDOM und bindet das globale MUI-Theme ein.
*/

import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { ThemeProvider, createTheme } from "@mui/material/styles";

// Erstelle ein benutzerdefiniertes MUI-Theme mit Breakpoints und Farbpalette
const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0, // Kleinste Bildschirmgröße (Telefon)
      sm: 600, // Mobile Bildschirmbreite
      md: 900, // Tablet Bildschirmbreite
      lg: 1200, // Große Bildschirme (Laptop)
      xl: 1536, // Extra große Bildschirme
    },
  },
  palette: {
    primary: {
      main: "#1976d2", // Primärfarbe anpassen
    },
    secondary: {
      main: "#dc004e", // Sekundärfarbe anpassen
    },
  },
});

// Render der App im Root-Element mit MUI-Theme
ReactDOM.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <App /> {/* Hauptkomponente */}
    </ThemeProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
