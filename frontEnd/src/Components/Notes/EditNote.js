
/**
 * Author: Fighan Suliman
 * Version: 1.0
 * Datum: 24.09.2025
 *
 * Lädt eine bestehende Notiz anhand der ID (aus URL)
 * Formular zum Bearbeiten von Titel, Inhalt, Tag, Kategorie und Typ
 * Bestehende Bilder anzeigen und löschen
 * Neue Bilder hochladen (mit Vorschau) und speichern
 * Änderungen ans Backend senden (updateNote)
 * Wichtig: CATEGORY / TYPE müssen mit den Enum-Werten im Backend übereinstimmen
 */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getNoteById,
  updateNote,
  fetchImagesForNote,
  deleteImage,
  handleImageUpload,
} from "../../api";
import {
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
  Grid,
  IconButton,
  MenuItem,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";

// Kategorie- und Typoptionen (Frontend → Backend Mapping)
const CATEGORY_OPTIONS = ["STUDIUM", "ARBEIT", "PRIVAT", "SONSTIGES"];
const TYPE_OPTIONS = [
  { label: "Text", value: "TEXT" },
  { label: "To-Do", value: "TODO" },
  { label: "Link", value: "LINK" },
  { label: "Bild", value: "IMAGE" },
  { label: "Dokument", value: "DOKUMENT" },
];

const EditNote = () => {
  // State für Notizdaten und Bilder
  const [note, setNote] = useState({
    title: "",
    content: "",
    tag: "",
    category: "",
    type: "",
    images: [],
  });
  const [newImages, setNewImages] = useState([]); // lokale neue Bilder mit Vorschau
  const [error, setError] = useState(null);       // Fehlernachrichten
  const [loading, setLoading] = useState(true);   // Ladezustand beim Start
  const [processing, setProcessing] = useState(false); // Status während Requests

  const { id } = useParams();      // ID aus URL
  const navigate = useNavigate();  // Navigation nach Speichern

  // --------------------------------------
  // Notiz und Bilder laden beim Start
  // --------------------------------------
  useEffect(() => {
    const fetchNote = async () => {
      try {
        const [fetchedNote, fetchedImages] = await Promise.all([
          getNoteById(id),
          fetchImagesForNote(id).catch(() => []), // falls keine Bilder
        ]);
        setNote({
          title: fetchedNote.title || "",
          content: fetchedNote.content || "",
          tag: fetchedNote.tags || "",
          category: fetchedNote.category || "",
          type: fetchedNote.type || "",
          images: fetchedImages || [],
        });
      } catch {
        setError("Fehler beim Laden der Notiz.");
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [id]);

  // Eingaben ändern (Textfelder)
  const handleInputChange = (e) => {
    setNote({ ...note, [e.target.name]: e.target.value });
  };

  // Neue Bilder auswählen (mit Vorschau)
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.every((f) => f.type.startsWith("image/"))) {
      return setError("Nur Bilddateien erlaubt.");
    }
    const previews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setNewImages((prev) => [...prev, ...previews]);
  };

  // Neues Bild aus der Vorschau entfernen
  const handleDeleteNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Bereits hochgeladenes Bild löschen (Backend-Request)
  const handleDeleteExistingImage = async (imageId) => {
    setProcessing(true);
    try {
      await deleteImage(imageId);
      setNote((prev) => ({
        ...prev,
        images: prev.images.filter((img) => img.id !== imageId),
      }));
    } catch {
      setError("Fehler beim Löschen des Bildes.");
    } finally {
      setProcessing(false);
    }
  };

  // Neue Bilder an Backend senden
  const handleUploadImages = async () => {
    const formData = new FormData();
    newImages.forEach((img) => formData.append("image", img.file));
    try {
      await handleImageUpload(id, formData);
    } catch {
      setError("Fehler beim Hochladen der Bilder.");
    }
  };

  // Formular absenden → Daten + Bilder speichern
  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const data = {
        title: note.title,
        content: note.content,
        tag: note.tag,
        category: note.category,
        type: note.type,
      };
      if (newImages.length > 0) await handleUploadImages();
      await updateNote(id, data);
      navigate("/");
    } catch {
      setError("Fehler beim Aktualisieren.");
    } finally {
      setProcessing(false);
    }
  };

  // Ladeanzeige
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // --------------------------------------
  // UI: Formular zum Bearbeiten der Notiz
  // --------------------------------------
  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
      <Card sx={{ width: 600, p: 3, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Notiz bearbeiten
          </Typography>
          {error && <Typography color="error">{error}</Typography>}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* Titel */}
              <Grid item xs={12}>
                <TextField
                  label="Titel"
                  fullWidth
                  value={note.title}
                  onChange={handleInputChange}
                  name="title"
                  required
                />
              </Grid>

              {/* Inhalt */}
              <Grid item xs={12}>
                <TextField
                  label="Inhalt"
                  fullWidth
                  multiline
                  rows={4}
                  value={note.content}
                  onChange={handleInputChange}
                  name="content"
                  required
                />
              </Grid>

              {/* Tag */}
              <Grid item xs={12}>
                <TextField
                  label="Tag"
                  fullWidth
                  value={note.tag}
                  onChange={handleInputChange}
                  name="tag"
                />
              </Grid>

              {/* Kategorie */}
              <Grid item xs={12}>
                <TextField
                  select
                  label="Kategorie"
                  fullWidth
                  value={note.category}
                  onChange={handleInputChange}
                  name="category"
                >
                  <MenuItem value="">(keine Kategorie)</MenuItem>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Typ */}
              <Grid item xs={12}>
                <TextField
                  select
                  label="Typ"
                  fullWidth
                  value={note.type}
                  onChange={handleInputChange}
                  name="type"
                >
                  <MenuItem value="">(kein Typ)</MenuItem>
                  {TYPE_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Neue Bilder hochladen */}
              <Grid item xs={12}>
                <Button variant="contained" component="label">
                  Bild auswählen
                  <input
                    type="file"
                    hidden
                    multiple
                    onChange={handleImageChange}
                    accept="image/*"
                  />
                </Button>
              </Grid>

              {/* Vorschau neuer Bilder */}
              {newImages.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1">Neue Bilder:</Typography>
                  <Grid container spacing={1}>
                    {newImages.map((img, index) => (
                      <Grid item key={index} xs={4}>
                        <Box position="relative">
                          <img
                            src={img.preview}
                            alt={`Vorschau ${index}`}
                            style={{
                              width: "100%",
                              height: "200px",
                              objectFit: "cover",
                              borderRadius: "4px",
                            }}
                          />
                          <IconButton
                            onClick={() => handleDeleteNewImage(index)}
                            sx={{
                              position: "absolute",
                              top: 8,
                              right: 8,
                              backgroundColor: "rgba(255,255,255,0.7)",
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              )}

              {/* Bereits vorhandene Bilder */}
              <Grid item xs={12}>
                {note.images.length > 0 ? (
                  <div>
                    <Typography variant="h6">Vorhandene Bilder</Typography>
                    {note.images.map((image) => (
                      <Box key={image.id} display="flex" alignItems="center" gap={2} mb={1}>
                        <img
                          src={`${image.url}`}
                          alt={image.filename}
                          width="30%"
                          style={{
                            objectFit: "cover",
                            border: "1px solid #ccc",
                            borderRadius: 4,
                          }}
                        />
                        <IconButton
                          onClick={() => handleDeleteExistingImage(image.id)}
                          disabled={processing}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    ))}
                  </div>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Keine Bilder vorhanden.
                  </Typography>
                )}
              </Grid>

              {/* Buttons */}
              <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2}>
                <Button variant="outlined" onClick={() => navigate("/")}>
                  Abbrechen
                </Button>
                <Button type="submit" variant="contained" disabled={processing}>
                  {processing ? <CircularProgress size={24} /> : "Aktualisieren"}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EditNote;
