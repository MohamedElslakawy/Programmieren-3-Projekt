/**
 * Author: Fighan Suliman
 * Version: 1.0
 * Datum: 24.09.2025
 * 
 * ProtectedRoute-Komponente:
 * - Schützt bestimmte Routen vor unautorisiertem Zugriff.
 * - Prüft, ob ein Benutzer im AuthContext eingeloggt ist.
 * - Wenn kein Benutzer eingeloggt ist, wird zur Login-Seite weitergeleitet.
 * - Wenn der Benutzer eingeloggt ist, werden die Kinder-Komponenten (children) angezeigt.
 */

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  //  Zugriff auf Auth-Kontext
  const { user } = useAuth();

  //  Benutzer nicht eingeloggt → Weiterleitung zur Login-Seite
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  //  Benutzer eingeloggt → zeige Inhalte der geschützten Route
  return children;
};

export default ProtectedRoute;
