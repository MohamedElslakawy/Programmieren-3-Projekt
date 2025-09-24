/**
 * Author: Fighan Suliman
 * Version: 1.0
 * Datum: 24.09.2025
 *
 * Die `FilterBar` Komponente ist eine React-Komponente, die eine einfache
 * Filterleiste für Notizen bereitstellt. Benutzer können nach Suchbegriff,
 * Kategorie, Typ und Zeitraum filtern. Die ausgewählten Filterwerte werden
 * über die `onApply` Callback-Funktion an die übergeordnete Komponente
 * weitergegeben. Die Komponente nutzt Material-UI für die UI-Elemente und
 * stellt eine übersichtliche, responsive Filterleiste bereit.
 */

// Importiere React und Material-UI-Komponenten
import React, { useState } from "react";
import { Box, TextField, MenuItem, Button } from "@mui/material";

// Vordefinierte Kategorien für die Filterleiste
const categories = [
  "",
  "STUDIUM",
  "ARBEIT",
  "PRIVAT",
  "FAMILIE",
  "FINANZEN",
  "ANDERE",
];

// Vordefinierte Notiz-Typen
const types = ["", "TEXT", "TODO", "IMAGE", "LINK", "DOKUMENT"];

// Hauptkomponente FilterBar
export default function FilterBar({ onApply }) {
  // State für die Eingaben der Filterleiste
  const [q, setQ] = useState(""); // Suchbegriff
  const [category, setCategory] = useState(""); // Kategorie
  const [type, setType] = useState(""); // Typ der Notiz
  const [from, setFrom] = useState(""); // Startdatum im Format YYYY-MM-DD
  const [to, setTo] = useState(""); // Enddatum im Format YYYY-MM-DD

  return (
    // Box-Container mit flexibler Darstellung der Filterelemente
    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
      {/* Suchfeld für Titel/Content */}
      <TextField
        label="Suche (Titel/Content)"
        size="small"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      {/* Dropdown für Kategorien */}
      <TextField
        select
        label="Kategorie"
        size="small"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        sx={{ minWidth: 160 }}
      >
        {categories.map((c) => (
          <MenuItem key={c} value={c}>
            {c || "Alle"} {/* Zeigt "Alle" an, wenn keine Kategorie gewählt */}
          </MenuItem>
        ))}
      </TextField>

      {/* Dropdown für Typ der Notiz */}
      <TextField
        select
        label="Art"
        size="small"
        value={type}
        onChange={(e) => setType(e.target.value)}
        sx={{ minWidth: 140 }}
      >
        {types.map((t) => (
          <MenuItem key={t} value={t}>
            {t || "Alle"} {/* Zeigt "Alle" an, wenn kein Typ gewählt */}
          </MenuItem>
        ))}
      </TextField>

      {/* Datumsfeld "Von" */}
      <TextField
        label="Von"
        type="date"
        size="small"
        value={from}
        onChange={(e) => setFrom(e.target.value)}
        InputLabelProps={{ shrink: true }} // Label bleibt über dem Eingabefeld
      />

      {/* Datumsfeld "Bis" */}
      <TextField
        label="Bis"
        type="date"
        size="small"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        InputLabelProps={{ shrink: true }} // Label bleibt über dem Eingabefeld
      />

      {/* Button zum Anwenden der Filter */}
      <Button
        variant="contained"
        onClick={() =>
          onApply({
            q,
            category: category || undefined, // Leere Strings werden als undefined gesendet
            type: type || undefined,
            from: from ? `${from}T00:00:00Z` : undefined, // Zeitstempel von Mitternacht
            to: to ? `${to}T23:59:59Z` : undefined, // Zeitstempel bis Ende des Tages
          })
        }
      >
        Filtern
      </Button>
    </Box>
  );
}
