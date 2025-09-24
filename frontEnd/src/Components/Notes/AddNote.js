
/**
 * Author: Fighan Suliman
 * Version: 1.0
 * Datum: 24.09.2025
 *
 * React-Komponente zum Erstellen einer neuen Notiz
 * Diese Komponente beinhaltet:
 * ein Formular für Titel, Beschreibung, Tags
 * Auswahlfelder für Kategorie und Typ (Enums)
 * Möglichkeit, mehrere Bilder hochzuladen und in der Vorschau anzuzeigen
 * Validierung der Eingaben (Pflichtfelder, Bildgrößen)
 * Speicherung über eine API (createNote → Backend)
 * Anzeige von Feedback (Snackbar)
 * Navigation zurück zur Startseite nach dem Speichern
 */
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Snackbar,
  Alert,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { createNote } from "../../api"; // API-Funktion zum Speichern der Notiz

// Kategorien-Optionen (Enum-Werte aus dem Backend)
const CATEGORY_OPTIONS = ["STUDIUM", "ARBEIT", "PRIVAT", "SONSTIGES"];

// Typ-Optionen (Enum-Werte, müssen exakt mit Backend übereinstimmen)
const TYPE_OPTIONS = [
  { label: "Text", value: "TEXT" },
  { label: "To-Do", value: "TODO" },
  { label: "Bild", value: "IMAGE" },
  { label: "Link", value: "LINK" },
  { label: "Dokument", value: "DOKUMENT" },
];

function AddNote({ onAddNote }) {
  // Lokale State-Variablen für Formularfelder
  const [title, setTitle] = useState("");           // Titel der Notiz
  const [description, setDescription] = useState(""); // Hauptinhalt der Notiz
  const [tags, setTags] = useState("");             // Tags als Komma-getrennter Text
  const [category, setCategory] = useState("");     // Kategorie-Enum
  const [type, setType] = useState("");             // Typ-Enum (z.B. IMAGE, TEXT)
  const [images, setImages] = useState([]);         // Liste hochgeladener Bilder
  const [isSubmitting, setIsSubmitting] = useState(false); // Status während des Speicherns

  // State für Feedback (Snackbar)
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState("");
  const [snackType, setSnackType] = useState("success");

  const navigate = useNavigate();

  // ---------------------------------------------
  // Funktion: Bild-Upload
  // - prüft Dateigröße (max 2MB)
  // - prüft Dateityp (nur Bilder)
  // - erstellt Vorschau mit URL.createObjectURL
  // ---------------------------------------------
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files || []);
    const newImages = files
      .map((file) => {
        if (file.size > 2 * 1024 * 1024) {
          setSnackMsg("Dateigröße muss kleiner als 2MB sein.");
          setSnackType("error");
          setSnackOpen(true);
          return null;
        }
        if (!file.type.startsWith("image/")) {
          setSnackMsg("Nur Bilddateien sind erlaubt.");
          setSnackType("error");
          setSnackOpen(true);
          return null;
        }
        return { file, preview: URL.createObjectURL(file) };
      })
      .filter(Boolean);

    setImages((prev) => [...prev, ...newImages]);
  };

  // Einzelnes Bild entfernen
  const handleRemoveImage = (index) => {
    try {
      URL.revokeObjectURL(images[index].preview);
    } catch {}
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Cleanup beim Unmount → verhindert Memory-Leaks
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        try {
          URL.revokeObjectURL(img.preview);
        } catch {}
      });
    };
  }, []);

  // ---------------------------------------------
  // Funktion: Notiz speichern
  // - prüft Pflichtfelder (Titel + Beschreibung)
  // - wenn Typ = IMAGE, dann mindestens ein Bild
  // - baut FormData mit allen Feldern + Bildern
  // - sendet Request an Backend
  // - zeigt Erfolg oder Fehler in Snackbar
  // ---------------------------------------------
  const handleSaveNote = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      setSnackMsg("Titel und Beschreibung sind erforderlich!");
      setSnackType("error");
      setSnackOpen(true);
      return;
    }

    if (type === "IMAGE" && images.length === 0) {
      setSnackMsg("Für Typ Bild muss mindestens ein Bild hochgeladen werden.");
      setSnackType("error");
      setSnackOpen(true);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setSnackMsg("Benutzer ist nicht authentifiziert!");
      setSnackType("error");
      setSnackOpen(true);
      return;
    }

    // FormData mit allen Feldern
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("content", description); // Kompatibilität
    formData.append("tags", tags);
    if (category) formData.append("category", category);
    if (type) formData.append("type", type);
    images.forEach((img) => formData.append("images", img.file));

    setIsSubmitting(true);

    try {
      // Request an API
      const saved = await createNote(formData, token); 
      setSnackMsg("Notiz erfolgreich gespeichert!");
      setSnackType("success");
      setSnackOpen(true);

      // Callback für Parent-Komponente
      if (onAddNote) onAddNote(saved);

      // Formular zurücksetzen
      setTitle("");
      setDescription("");
      setTags("");
      setCategory("");
      setType("");
      images.forEach((img) => {
        try {
          URL.revokeObjectURL(img.preview);
        } catch {}
      });
      setImages([]);

      // kleine Verzögerung → dann zur Startseite
      setTimeout(() => navigate("/"), 600);
    } catch (err) {
      console.error("Fehler beim Speichern:", err);
      setSnackMsg(err?.message || "Fehler beim Speichern der Notiz.");
      setSnackType("error");
      setSnackOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card component="form" onSubmit={handleSaveNote}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Neue Notiz hinzufügen
        </Typography>

        {/* Eingabefeld: Titel */}
        <TextField
          label="Titel"
          fullWidth
          margin="normal"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Eingabefeld: Beschreibung */}
        <TextField
          label="Beschreibung"
          multiline
          rows={4}
          fullWidth
          margin="normal"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Eingabefeld: Tags */}
        <TextField
          label="Tags"
          fullWidth
          margin="normal"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="z.B. Uni, Arbeit, Privat"
        />

        {/* Dropdown: Kategorie */}
        <TextField
          select
          label="Kategorie"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          fullWidth
          margin="normal"
        >
          <MenuItem value="">(keine Kategorie)</MenuItem>
          {CATEGORY_OPTIONS.map((opt) => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </TextField>

        {/* Dropdown: Typ */}
        <TextField
          select
          label="Typ"
          value={type}
          onChange={(e) => setType(e.target.value)}
          fullWidth
          margin="normal"
        >
          <MenuItem value="">(kein Typ)</MenuItem>
          {TYPE_OPTIONS.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>

        {/* Button: Bilder hochladen */}
        <div style={{ margin: "20px 0" }}>
          <Button
            variant="contained"
            component="label"
            color="primary"
            disabled={isSubmitting}
          >
            Bilder hochladen
            <input
              type="file"
              accept="image/*"
              hidden
              multiple
              onChange={handleImageUpload}
            />
          </Button>
        </div>

        {/* Bild-Vorschau */}
        {images.length > 0 && (
          <Grid container spacing={2} style={{ marginTop: "20px" }}>
            {images.map((image, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <div style={{ position: "relative" }}>
                  <img
                    src={image.preview}
                    alt={`Hochgeladenes Bild ${index}`}
                    style={{
                      width: "100%",
                      height: "auto",
                      maxHeight: "200px",
                      objectFit: "contain",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                  />
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleRemoveImage(index)}
                    style={{
                      position: "absolute",
                      top: "5px",
                      right: "5px",
                      fontSize: "10px",
                      padding: "2px 5px",
                    }}
                  >
                    Entfernen
                  </Button>
                </div>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Button: Notiz speichern */}
        <Button
          type="submit"
          variant="contained"
          color="secondary"
          style={{ marginTop: "20px" }}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Speichern..." : "Notiz speichern"}
        </Button>
      </CardContent>

      {/* Snackbar für Feedback */}
      <Snackbar
        open={snackOpen}
        autoHideDuration={3000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackOpen(false)}
          severity={snackType}
          sx={{ width: "100%" }}
        >
          {snackMsg}
        </Alert>
      </Snackbar>
    </Card>
  );
}

export default AddNote;
