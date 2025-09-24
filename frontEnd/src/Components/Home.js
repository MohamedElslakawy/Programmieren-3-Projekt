/**
 * Author: Fighan Suliman
 * Version: 1.0
 * Datum: 24.09.2025
 *
 * Die `Home` Komponente ist die Hauptseite der EduNotizen-Anwendung. Sie lädt
 * die Notizen einmal beim Mount vom Server, prüft die Token-Gültigkeit und
 * zeigt Lade- bzw. Fehlermeldungen an. Zusätzlich bietet sie umfangreiche
 * Filtermöglichkeiten:
 * - Suchtext in Titel/Content
 * - Tag-Pills
 * - Kategorie- und Typ-Filter
 * - Zeitraumfilter (Von/Bis)
 * Lange Inhalte können ein- oder ausgeklappt werden, und Notizen lassen sich
 * direkt löschen. Alle Filter wirken clientseitig, um schnelle UI-Interaktionen
 * ohne erneutes Laden vom Server zu ermöglichen.
 */

// Import von React und Material-UI Komponenten
import React, { useState, useEffect } from "react";
import {
  Typography,
  CircularProgress,
  Box,
  Grid,
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  Button,
} from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { deleteNote, getNotes } from "../api";
import NoteList from "./Notes/NoteList";
import UserProfile from "./UserProfile";

// Home-Komponente
const Home = ({ searchTerm = "" }) => {
  // Grundzustände für Notizen, UI und Filter
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [expandedNoteIds, setExpandedNoteIds] = useState([]);

  // Filterzustände
  const [selectedTag, setSelectedTag] = useState(null);
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const navigate = useNavigate();

  // Optionen für Kategorie und Typ
  const CATEGORY_OPTIONS = ["STUDIUM", "ARBEIT", "PRIVAT", "SONSTIGES"];
  const TYPE_OPTIONS = ["TEXT", "TODO", "LINK", "BILD"];

  // Token-Prüfung
  const checkTokenExpiration = (token) => {
    if (!token) return false;
    try {
      const decodedToken = jwtDecode(token);
      return decodedToken?.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  };

  // Notizen vom Server laden
  const fetchNotes = async () => {
    const token = localStorage.getItem("token");
    if (!token || !checkTokenExpiration(token)) {
      setError("⚠️ Deine Sitzung ist abgelaufen. Bitte logge dich erneut ein.");
      navigate("/login");
      return;
    }

    try {
      const data = await getNotes();
      const safeData = Array.isArray(data) ? data : [];
      setNotes(safeData);
      setFilteredNotes(safeData);
      setError("");
    } catch (err) {
      console.error("Fehler beim Laden der Notizen:", err);
      setError("Es gab ein Problem beim Laden deiner Notizen.");
    } finally {
      setIsLoading(false);
    }
  };

  // Einmaliges Laden beim Mount
  useEffect(() => {
    fetchNotes();
  }, []);

  // Clientseitige Filter
  useEffect(() => {
    if (!Array.isArray(notes)) return;

    let filtered = [...notes];

    // Freitextsuche
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          (note?.title || "").toLowerCase().includes(q) ||
          (note?.content || "").toLowerCase().includes(q)
      );
    }

    // Tag-Filter
    if (selectedTag) {
      filtered = filtered.filter(
        (note) => Array.isArray(note?.tags) && note.tags.includes(selectedTag)
      );
    }

    // Kategorie-Filter
    if (category) {
      filtered = filtered.filter((note) => (note?.category || "") === category);
    }

    // Typ-Filter
    if (type) {
      filtered = filtered.filter((note) => (note?.type || "") === type);
    }

    // Zeitraum-Filter
    if (dateFrom || dateTo) {
      const fromTs = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : null;
      const toTs = dateTo ? new Date(`${dateTo}T23:59:59.999`).getTime() : null;

      filtered = filtered.filter((note) => {
        const ts = note?.createdAt ? new Date(note.createdAt).getTime() : null;
        if (!ts) return false;
        if (fromTs && ts < fromTs) return false;
        if (toTs && ts > toTs) return false;
        return true;
      });
    }

    setFilteredNotes(filtered);
  }, [searchTerm, notes, selectedTag, category, type, dateFrom, dateTo]);

  // Notiz löschen
  const handleDelete = async (noteId) => {
    try {
      const response = await deleteNote(noteId);
      if (response && response.success) {
        setSuccessMessage(response.message || "Notiz gelöscht.");
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
        setFilteredNotes((prev) => prev.filter((n) => n.id !== noteId));
        setError("");
      } else {
        setError("Löschen der Notiz fehlgeschlagen. Bitte versuche es erneut.");
      }
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Fehler beim Löschen der Notiz:", err);
      setError("Es gab ein Problem beim Löschen deiner Notiz.");
    }
  };

  // Content ein-/ausklappen
  const handleToggleContent = (noteId) => {
    setExpandedNoteIds((prev) =>
      prev.includes(noteId)
        ? prev.filter((id) => id !== noteId)
        : [...prev, noteId]
    );
  };

  // Tag-Pill-Filter
  const handleTagClick = (tag) => {
    setSelectedTag(tag === selectedTag ? null : tag);
  };

  // Filter zurücksetzen
  const resetFilters = () => {
    setSelectedTag(null);
    setCategory("");
    setType("");
    setDateFrom("");
    setDateTo("");
  };

  // Ladeindikator
  if (isLoading) {
    return (
      <Box sx={{ textAlign: "center", mt: 5 }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Notizen werden geladen...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: { xs: "10px", sm: "20px", md: "40px" } }}>
      {/* Benutzerprofil */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
        }}
      >
        <UserProfile />
      </Box>

      {/* Erfolg-/Fehlermeldungen */}
      {successMessage && (
        <Typography color="success.main" sx={{ mb: 2 }}>
          {successMessage}
        </Typography>
      )}
      {error && (
        <Typography color="error.main" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {/* Filterleiste */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr 1fr auto" },
          gap: 2,
          mb: 2,
          alignItems: "center",
        }}
      >
        <TextField
          select
          label="Kategorie"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          size="small"
        >
          <MenuItem value="">(alle)</MenuItem>
          {CATEGORY_OPTIONS.map((opt) => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Typ"
          value={type}
          onChange={(e) => setType(e.target.value)}
          size="small"
        >
          <MenuItem value="">(alle)</MenuItem>
          {TYPE_OPTIONS.map((opt) => (
            <MenuItem key={opt} value={opt}>
              {opt}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Von"
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Bis"
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          size="small"
          InputLabelProps={{ shrink: true }}
        />

        <Tooltip title="Filter zurücksetzen">
          <span>
            <IconButton onClick={resetFilters} color="primary">
              <RestartAltIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {/* Tag-Pills */}
      <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
        {Array.from(
          new Set(
            (Array.isArray(notes) ? notes : []).flatMap(
              (note) => note?.tags || []
            )
          )
        ).map((tag) => (
          <Box
            key={tag}
            onClick={() => handleTagClick(tag)}
            sx={{
              px: 2,
              py: 0.5,
              borderRadius: "16px",
              cursor: "pointer",
              backgroundColor:
                selectedTag === tag ? "primary.main" : "grey.300",
              color: selectedTag === tag ? "white" : "black",
              "&:hover": {
                backgroundColor:
                  selectedTag === tag ? "primary.dark" : "grey.400",
              },
              userSelect: "none",
            }}
          >
            {tag}
          </Box>
        ))}
        {selectedTag && (
          <Button size="small" onClick={() => setSelectedTag(null)}>
            Tag-Filter entfernen
          </Button>
        )}
      </Box>

      {/* Notizenliste */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={12} md={9}>
          <NoteList
            notes={filteredNotes}
            expandedNoteIds={expandedNoteIds}
            handleToggleContent={handleToggleContent}
            handleDelete={handleDelete}
            navigate={navigate}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

// Default-Export
export default Home;
