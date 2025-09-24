/**
 * Author: Fighan Suliman
 * Version: 1.0
 * Datum: 24.09.2025
 *
 * Die `NoteCard` Komponente stellt eine einzelne Notiz-Karte dar, inklusive
 * Vorschaubildern, Titel, Inhalt, Tags, Kategorie und Typ. Sie bietet
 * Funktionen zum Teilen, Bearbeiten und Löschen der Notiz. Außerdem kann
 * der Inhalt bei Bedarf erweitert oder reduziert angezeigt werden. Ein
 * Dialog zeigt die Notizdetails in voller Ansicht an, inklusive großer
 * Bilder, vollständiger Inhalte und Tags. Snackbar-Meldungen informieren
 * den Benutzer über erfolgreiche oder fehlgeschlagene Aktionen.
 */

// Importiere React und Material-UI-Komponenten
import React, { useState } from "react";
import { createShareLink } from "../../api"; // API für Share-Link
import {
  Card,
  CardContent,
  Typography,
  CardMedia,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Grid,
  Divider,
  Chip,
  Snackbar,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

// NoteCard-Komponente
const NoteCard = ({
  note,               // Notiz-Daten
  expandedNoteIds,    // IDs der erweiterten Notizen
  handleToggleContent,// Funktion zum Erweitern/Reduzieren des Inhalts
  handleDelete,       // Funktion zum Löschen der Notiz
  navigate,           // Navigation-Funktion
}) => {
  // Lokale States für ausgewählte Notiz, Dialog, Snackbar
  const [selectedNote, setSelectedNote] = useState(null);
  const [open, setOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState("success");

  // ─────────────────────────────────────────────────────────
  // 🔎 Robust-Formatter für Kategorie/Typ (Frontend-sicher):
  //    - akzeptiert String / Objekt / sonstige Typen
  //    - zeigt "—" wenn leer
  //    - macht Title-Case fürs Auge
  // ─────────────────────────────────────────────────────────
  const humanize = (txt) => {
    if (!txt) return "—";
    return String(txt)
      .toLowerCase()
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const toLabel = (val) => {
    if (val == null) return "—";
    if (typeof val === "string") return humanize(val.trim());
    if (typeof val === "object") {
      // häufige Felder aus DTOs
      if (val.name) return humanize(val.name);
      if (val.label) return humanize(val.label);
    }
    try {
      return humanize(String(val));
    } catch {
      return "—";
    }
  };

  // Labels für die Kartenansicht
  const categoryLabel = toLabel(
    note?.category ?? note?.categoryName ?? note?.category_label
  );
  const typeLabel = toLabel(note?.type ?? note?.typeName ?? note?.type_label);

  // Funktion zum Kürzen langer Inhalte
  const truncateContent = (content) =>
    content?.length > 25 ? content.substring(0, 25) + "..." : content;

  // Öffnet den Detail-Dialog
  const handleImageClick = () => {
    setSelectedNote(note);
    setOpen(true);
  };

  // Schließt den Detail-Dialog
  const handleClose = () => {
    setOpen(false);
    setSelectedNote(null);
  };

  // Share-Link erzeugen und in Zwischenablage kopieren
  const handleShare = async (id) => {
    try {
      const data = await createShareLink(id);
      const shareUrl = window.location.origin + data.url;
      await navigator.clipboard.writeText(shareUrl);
      setSnackbarMessage("Share-Link wurde kopiert ✅");
      setSnackbarType("success");
      setSnackbarOpen(true);
    } catch (e) {
      console.error("Share-Fehler:", e);
      setSnackbarMessage("Fehler beim Erstellen des Share-Links ❌");
      setSnackbarType("error");
      setSnackbarOpen(true);
    }
  };

  return (
    <>
      <Card
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: "8px",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          transition: "box-shadow 0.3s ease",
          border: "2px solid #1976d2",
        }}
      >
        {/* Bilder-Grid */}
        {note?.images?.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              padding: "8px",
              paddingBottom: 0,
            }}
          >
            {note.images.map((image, index) => (
              <CardMedia
                key={index}
                component="img"
                alt={`Note image ${index + 1}`}
                image={image.url}
                style={{
                  width: "calc(50% - 4px)",
                  height: "120px",
                  objectFit: "cover",
                  borderRadius: "4px",
                  flexGrow: 1,
                  cursor: "pointer",
                }}
                onClick={handleImageClick}
                onError={(e) => (e.target.style.display = "none")}
              />
            ))}
          </div>
        )}

        {/* Inhalt */}
        <CardContent style={{ flex: 1 }}>
          <Typography variant="h6" style={{ fontWeight: "bold", marginBottom: "10px" }}>
            {note?.title}
          </Typography>

          <Typography variant="body1" style={{ marginBottom: "10px" }}>
            {note?.content?.length <= 25 || expandedNoteIds.includes(note.id)
              ? note?.content
              : truncateContent(note?.content)}
          </Typography>

          {/* Button zum Ausklappen */}
          {note?.content?.length > 25 && (
            <Button
              variant="text"
              color="primary"
              onClick={() => handleToggleContent(note.id)}
              style={{ padding: 0, marginBottom: "10px" }}
            >
              {expandedNoteIds.includes(note.id) ? "Weniger" : "Mehr anzeigen"}
            </Button>
          )}

          {/* Tags */}
          <Typography variant="body2" color="textSecondary" style={{ marginBottom: "6px" }}>
            <strong>Tag:</strong>{" "}
            {Array.isArray(note?.tags) && note.tags.length ? note.tags.join(", ") : "Keine Tags"}
          </Typography>

          {/* Kategorie + Typ */}
          <Typography variant="body2" color="textSecondary" style={{ marginBottom: "6px" }}>
            <strong>Kategorie:</strong> {categoryLabel}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            <strong>Typ:</strong> {typeLabel}
          </Typography>

          {/* Datum */}
          <Typography variant="body2" color="textSecondary" style={{ marginTop: "8px" }}>
            Erstellt am: {note?.createdAt ? new Date(note.createdAt).toLocaleString() : "—"}
          </Typography>
        </CardContent>

        {/* Buttons: Share, Edit, Delete */}
        <div style={{ display: "flex", gap: "5px" }}>
          <Button
            variant="outlined"
            onClick={() => handleShare(note.id)}
            sx={{
              cursor: "pointer",
              borderColor: "red",
              color: "red",
              "&:hover": { borderColor: "red", backgroundColor: "#f0f0f0" },
            }}
          >
            Share
          </Button>

          <div>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate(`/edit-note/${note.id}`)}
              style={{ marginRight: "10px" }}
            >
              Edit
            </Button>

            <Button
              variant="outlined"
              color="secondary"
              onClick={() => handleDelete(note.id)}
            >
              Delete
            </Button>
          </div>
        </div>
      </Card>

      {/* Detail-Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth scroll="paper">
        <DialogTitle>
          Note Details
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{ position: "absolute", right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {selectedNote && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <img
                  src={selectedNote.images?.[0]?.url}
                  alt="Full size preview"
                  style={{
                    width: "100%",
                    height: "auto",
                    maxHeight: "60vh",
                    objectFit: "contain",
                    borderRadius: "8px",
                  }}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h5" gutterBottom>{selectedNote.title}</Typography>
                <Typography variant="body1" paragraph>{selectedNote.content}</Typography>
                <Divider sx={{ my: 2 }} />

                {/* Tags */}
                <Typography variant="subtitle2" gutterBottom>Tags:</Typography>
                <div style={{ marginBottom: "16px" }}>
                  {(selectedNote.tags || []).map((tag, index) => (
                    <Chip key={index} label={tag} size="small" sx={{ mr: 1, mb: 1 }} />
                  ))}
                </div>

                {/* Kategorie + Typ im Dialog */}
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  <strong>Kategorie:</strong>{" "}
                  {toLabel(selectedNote.category ?? selectedNote.categoryName ?? selectedNote.category_label)}
                  &nbsp;|&nbsp; <strong>Typ:</strong>{" "}
                  {toLabel(selectedNote.type ?? selectedNote.typeName ?? selectedNote.type_label)}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  Created at: {selectedNote.createdAt ? new Date(selectedNote.createdAt).toLocaleString() : "—"}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar für Erfolg/Fehler */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarType}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default NoteCard;
