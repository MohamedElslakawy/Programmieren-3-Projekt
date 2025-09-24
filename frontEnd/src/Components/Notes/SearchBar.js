/**
 * Author: Fighan Suliman
 * Version: 1.0
 * Datum: 24.09.2025
 *
 * Die `SearchBar` Komponente stellt ein einfaches Suchfeld bereit, mit dem
 * Benutzer Notizen nach Titel oder Inhalt durchsuchen können. Sie nimmt
 * einen `searchTerm` und eine `setSearchTerm` Funktion als Props entgegen,
 * um den Suchbegriff zu verwalten. Die Eingaben des Benutzers werden sofort
 * an die übergeordnete Komponente weitergegeben, wodurch eine reaktive
 * Filterung der Notizen ermöglicht wird. Das Textfeld nutzt Material-UI
 * Komponenten für ein konsistentes Design.
 */

// Importiere React und Material-UI-Komponenten
import React from "react";
import { TextField } from "@mui/material";

// Hauptkomponente SearchBar
const SearchBar = ({ searchTerm, setSearchTerm }) => {
  // Handler für Änderungen im Textfeld
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);  // aktualisiert den Suchbegriff im State
  };

  return (
      <TextField
          label="Suchen nach Notizen"            // Beschriftung des Textfeldes
          variant="standard"                      // Standard-Design von Material-UI
          fullWidth                                // volle Breite des Containers
          value={searchTerm}                       // aktueller Wert des Suchbegriffs
          onChange={handleSearchChange}           // reagiert auf Texteingaben
          style={{ marginBottom: "20px" }}        // Abstand nach unten
          placeholder="Schreibe hier, um nach Notizen zu suchen" // Platzhaltertext
      />
  );
};

// Export der Komponente
export default SearchBar;
