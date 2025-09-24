/*
  Author: Fighan Suliman
  Version: 1.0
  Datum: 24.09.2025

  Schützt bestimmte Routen, indem geprüft wird, ob der Benutzer eingeloggt ist.
*/

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // AuthContext importieren

// ProtectedRoute-Komponente: Prüft, ob der Benutzer eingeloggt ist
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth(); // Benutzerzustand aus AuthContext holen

  if (!user) {
    // Wenn kein Benutzer eingeloggt ist, Weiterleitung zur Login-Seite
    return <Navigate to="/login" />;
  }

  return children; // Wenn Benutzer eingeloggt ist, Inhalt der geschützten Route rendern
};

export default ProtectedRoute;
