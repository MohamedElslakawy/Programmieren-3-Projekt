/**
 * Author: Fighan Suliman
 * Version: 1.0
 * Datum: 24.09.2025
 *
 * UserProfile-Komponente:
 * - Zeigt den aktuellen Benutzernamen an, basierend auf dem AuthContext.
 * - Entschlüsselt optional das JWT-Token, um weitere Benutzerdaten abzurufen.
 * - Begrüßt den Benutzer und formatiert den ersten Buchstaben des Benutzernamens groß.
 */

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext"; // Zugriff auf Authentifizierungsdaten
import { jwtDecode } from "jwt-decode"; // Zum Decodieren von JWT-Tokens

const UserProfile = () => {
  //  Zugriff auf Benutzerinformationen aus dem AuthContext
  const { user } = useAuth();
  //  Zustand für den Benutzernamen
  const [username, setUsername] = useState("");

  //  useEffect wird ausgeführt, wenn sich der Benutzer ändert
  useEffect(() => {
    // Prüft, ob Benutzer und Token vorhanden sind
    if (user && user.token) {
      try {
        // Decodiert das JWT-Token (falls nötig)
        const decodedToken = jwtDecode(user.token);
        // Setzt den Benutzernamen aus den Context-Daten
        setUsername(user.username || "");
      } catch (error) {
        // Fehler beim Decodieren des Tokens in der Konsole ausgeben
        console.error('Fehler beim Entschlüsseln des Tokens:', error);
      }
    }
  }, [user]); // Abhängigkeit: user

  return (
    <div>
      {/* Begrüßt den Benutzer mit großgeschriebenem Anfangsbuchstaben */}
      <h2>
        Willkommen, {username.charAt(0).toUpperCase() + username.slice(1)}!
      </h2>
    </div>
  );
};

export default UserProfile;
