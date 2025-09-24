/**
 * Author: Fighan Suliman
 * Version: 1.0
 * Datum: 24.09.2025
 *
 * Die `NoteList` Komponente zeigt eine Liste von Notizen in einem Grid-Layout
 * an. Jede Notiz wird durch die `NoteCard` Komponente dargestellt. Um die
 * Performance zu verbessern, wird die Erstellung der Notiz-Elemente mit
 * `useMemo` optimiert, sodass eine Neuberechnung nur erfolgt, wenn sich die
 * relevanten Props ändern. Wenn keine Notizen vorhanden sind, wird eine
 * freundliche Meldung angezeigt. Die Komponente verwendet Material-UI für
 * das Layout und die Typografie und ist mit `React.memo` gegen unnötige
 * Re-Renders geschützt.
 */

// Importiere React und Material-UI-Komponenten
import React, { useMemo } from "react";
import { Grid, Typography, Box } from "@mui/material";
import NoteCard from "./NoteCard";

// Hauptkomponente NoteList
const NoteList = ({
  notes = [],               // Array von Notizen
  expandedNoteIds = [],     // IDs der Notizen mit erweitertem Inhalt
  handleToggleContent,      // Funktion zum Umschalten des erweiterten Inhalts
  handleDelete,             // Funktion zum Löschen einer Notiz
  navigate,                 // Navigation-Funktion
}) => {
  // Memoisierung der Notiz-Karten, um Performance zu verbessern
  const noteItems = useMemo(() => {
    return notes.map((note) => (
      <Grid
        item
        xs={12}   // 1 Spalte auf kleinen Bildschirmen
        sm={6}    // 2 Spalten auf kleinen bis mittleren Bildschirmen
        md={4}    // 3 Spalten auf mittleren Bildschirmen
        lg={3}    // 4 Spalten auf großen Bildschirmen
        key={note.id ?? `${note.title}-${Math.random()}`} // fallback Key
      >
        <NoteCard
          note={note}
          expandedNoteIds={expandedNoteIds}
          handleToggleContent={handleToggleContent}
          handleDelete={handleDelete}
          navigate={navigate}
        />
      </Grid>
    ));
  }, [notes, expandedNoteIds, handleToggleContent, handleDelete, navigate]);

  return (
    <Grid container spacing={3}>
      {notes.length === 0 ? (
        // Anzeige, wenn keine Notizen vorhanden sind
        <Grid item xs={12}>
          <Box
            sx={{
              py: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="body1" color="text.secondary">
              Keine Notizen verfügbar.
            </Typography>
          </Box>
        </Grid>
      ) : (
        // Notiz-Elemente anzeigen
        noteItems
      )}
    </Grid>
  );
};

// React.memo verhindert unnötige Re-Renders, wenn sich Props nicht ändern
export default React.memo(NoteList);
