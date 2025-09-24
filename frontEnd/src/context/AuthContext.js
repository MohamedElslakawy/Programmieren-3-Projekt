/**
 * Author: Fighan Suliman
 * Version: 1.0
 * Datum: 24.09.2025
 *
 * AuthContext & AuthProvider:
 * - Stellt Benutzerauthentifizierung und Tokenverwaltung bereit.
 * - Prüft JWT-Token beim Laden der App.
 * - Zeigt Benachrichtigungen (Snackbar) für Erfolg, Fehler oder Info an.
 */

import React, { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode"; // Zum Dekodieren von JWT-Tokens
import { Snackbar } from "@mui/material"; // Material UI Snackbar für Benachrichtigungen
import { logoutUser } from "../api"; // API-Funktion zum Ausloggen

//  Erstellen des AuthContext
const AuthContext = createContext();

//  AuthProvider-Komponente: Wrappt die gesamte App und stellt Authentifizierung bereit
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Benutzerzustand (Token + Username)
  const [loading, setLoading] = useState(true); // Ladezustand für Tokenprüfung
  const [alertMessage, setAlertMessage] = useState(""); // Nachricht für Snackbar
  const [alertSeverity, setAlertSeverity] = useState("success"); // 'success', 'error', 'info', 'warning'

  //  useEffect: Prüft Token beim ersten Laden der App
  useEffect(() => {
    const token = localStorage.getItem("token"); // Token aus localStorage holen
    if (token) {
      try {
        const decodedUser = jwtDecode(token); // Token dekodieren
        const currentTime = Date.now() / 1000; // Aktuelle Zeit in Sekunden
        const email = decodedUser.sub; // Email aus Token
        const username = email.split("@")[0]; // Username aus Email ableiten

        //  Token abgelaufen?
        if (decodedUser.exp < currentTime) {
          console.error("Token ist abgelaufen");
          logoutUser(); // Abgelaufenes Token löschen
          setUser(null); // Benutzer zurücksetzen
          setAlertMessage("Ihre Sitzung ist abgelaufen. Bitte loggen Sie sich erneut ein.");
          setAlertSeverity("error"); // Snackbar als Fehler anzeigen
        } else {
          //  Token gültig
          setUser({ token, username }); // Benutzer speichern
          setAlertMessage("Willkommen zurück! Sie sind eingeloggt.");
          setAlertSeverity("success"); // Snackbar als Erfolg anzeigen
        }
      } catch (error) {
        //  Fehler beim Dekodieren
        console.error("Fehler beim Dekodieren des Tokens:", error);
        localStorage.removeItem("token"); // Ungültiges Token entfernen
        setUser(null);
        setAlertMessage("Ungültiges Token. Bitte loggen Sie sich erneut ein.");
        setAlertSeverity("error");
      }
    } else {
      //  Kein Token gefunden
      setAlertMessage("Bitte loggen Sie sich ein, um auf die App zuzugreifen.");
      setAlertSeverity("info");
    }
    setLoading(false); // Ladezustand beenden
  }, []); // nur einmal beim Mount

  //  Ladeanzeige während Tokenprüfung
  if (loading) return <div>Laden...</div>;

  return (
    <AuthContext.Provider value={{ user, setUser, logoutUser }}>
      {children}
      {/*  Snackbar für Benachrichtigungen */}
      <Snackbar
        open={alertMessage !== ""}
        autoHideDuration={6000}
        onClose={() => setAlertMessage("")}
        message={alertMessage}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{
          backgroundColor:
            alertSeverity === "error"
              ? "red"
              : alertSeverity === "success"
              ? "green"
              : alertSeverity === "warning"
              ? "orange"
              : "blue",
        }}
      />
    </AuthContext.Provider>
  );
};

//  Custom Hook für einfachen Zugriff auf AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};
