/**
 * Author: Fighan Suliman
 * Version: 1.0
 * Date: 24.09.2025
 *
 * Diese React-Komponente stellt eine "Passwort vergessen"-Seite dar. 
 * Der Benutzer gibt seine E-Mail-Adresse und eine Antwort auf eine Sicherheitsfrage ein 
 * (die Anzahl der Buchstaben im Teil der E-Mail vor dem "@"-Symbol). 
 * Anschließend wird eine API aufgerufen, die überprüft, ob die Daten korrekt sind. 
 * Im Erfolgsfall wird ein Token gespeichert und der Benutzer nach kurzer Zeit 
 * auf die Reset-Seite weitergeleitet. Die Komponente beinhaltet Formularvalidierung, 
 * Fehlerbehandlung, Ladeanzeige und eine Snackbar für Erfolgsnachrichten.
 */

import React, { useState } from "react";
import {
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material"; // Importieren der MUI-Komponenten für UI
import { styled } from "@mui/system"; // Zum Erstellen von benutzerdefinierten Styles
import { useNavigate } from "react-router-dom"; // Für Navigation zwischen Seiten
import { verifyUser } from "../../api"; // API-Funktion zum Überprüfen des Benutzers

// Erstellen eines gestylten Paper-Containers für das Formular
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  maxWidth: "400px",
  margin: "auto",
  marginTop: theme.spacing(8),
  borderRadius: "12px",
  boxShadow: "0 3px 10px rgba(0, 0, 0, 0.2)",
}));

// Erstellen eines gestylten Formular-Containers
const Form = styled("form")(({ theme }) => ({
  width: "100%",
  marginTop: theme.spacing(1),
}));

// Hauptfunktionale Komponente für "Passwort vergessen"
function ForgetPassword() {
  const navigate = useNavigate(); // Zum Navigieren zur Reset-Seite
  const [email, setEmail] = useState(""); // Zustand für E-Mail-Adresse
  const [nameLength, setNameLength] = useState(""); // Zustand für die Antwort (Anzahl Buchstaben)
  const [emailError, setEmailError] = useState(""); // Fehleranzeige für E-Mail
  const [answerError, setAnswerError] = useState(""); // Fehleranzeige für Antwort
  const [loading, setLoading] = useState(false); // Ladezustand
  const [successMessage, setSuccessMessage] = useState(""); // Erfolgsnachricht
  const [snackbarOpen, setSnackbarOpen] = useState(false); // Zustand für Snackbar-Anzeige

  // Handler für E-Mail-Feld
  const handleChangeEmail = (e) => {
    setEmail(e.target.value); // E-Mail-Zustand aktualisieren
    setEmailError(""); // Fehler zurücksetzen
  };

  // Handler für Antwortfeld
  const handleChangeAnswer = (e) => {
    setNameLength(e.target.value); // Antwort-Zustand aktualisieren
    setAnswerError(""); // Fehler zurücksetzen
  };

  // Formular-Submit-Handler
  const handleSubmit = async (e) => {
    e.preventDefault(); // Verhindert Standardformularverhalten

    // Überprüfen, ob Felder leer sind
    if (!email || !nameLength) {
      setEmailError(email ? "" : "Email ist erforderlich");
      setAnswerError(nameLength ? "" : "Antwort ist erforderlich");
      return;
    }

    // E-Mail-Format validieren
    if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("Bitte eine gültige E-Mail-Adresse eingeben");
      return;
    }

    setLoading(true); // Ladezustand aktivieren

    try {
      // API-Aufruf zur Verifizierung
      const res = await verifyUser(email, nameLength);

      console.log("Success " + res.data.succes); // Debug-Ausgabe

      // Wenn erfolgreich
      if (res.data.success === true) {
        localStorage.setItem("resetPassToken", res.data.token); // Token speichern
        setSuccessMessage("Ein Link zum Zurücksetzen des Passworts wurde gesendet.");
        setSnackbarOpen(true); // Snackbar anzeigen

        // Nach 3 Sekunden zur Reset-Seite navigieren
        setTimeout(() => navigate("/reset-password"), 3000);
      } else {
        // Fehlerbehandlung bei falscher Antwort
        setEmailError("Fehler beim Senden des Links. Bitte später erneut versuchen.");
      }
    } catch (error) {
      // Fehler beim API-Aufruf
      setEmailError("Fehler beim Senden des Links. Bitte später erneut versuchen.");
    } finally {
      setLoading(false); // Ladezustand deaktivieren
    }
  };

  // JSX-Rendering
  return (
    <Container component="main" maxWidth="xs">
      <StyledPaper elevation={6}>
        <Typography component="h1" variant="h5" gutterBottom>
          Passwort vergessen
        </Typography>
        
        {/* Formular zum Zurücksetzen */}
        <Form onSubmit={handleSubmit} noValidate>
          {/* Eingabe E-Mail-Adresse */}
          <TextField
            margin="normal"
            required
            fullWidth
            label="E-Mail-Adresse"
            name="email"
            type="email"
            value={email}
            onChange={handleChangeEmail}
            error={!!emailError}
            helperText={emailError}
            autoComplete="email"
            autoFocus
          />

          {/* Antwort auf Sicherheitsfrage */}
          <TextField
            margin="normal"
            required
            fullWidth
            label="Antwort auf die Sicherheitsfrage"
            name="nameLength"
            value={nameLength}
            onChange={handleChangeAnswer}
            error={!!answerError}
            helperText={answerError}
          />

          {/* Hinweis zur Sicherheitsfrage */}
          <Typography variant="body2" color="textSecondary" align="left">
            Die Antwort ist die Anzahl der Buchstaben im Teil Ihrer E-Mail-Adresse vor dem "@"-Symbol.
          </Typography>

          {/* Ladeanzeige oder Absenden-Button */}
          {loading ? (
            <CircularProgress />
          ) : (
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
              Senden
            </Button>
          )}

          {/* Button zur Rückkehr zum Login */}
          <Button fullWidth variant="outlined" onClick={() => navigate("/login")} sx={{ mt: 2 }}>
            Passwort doch noch im Kopf? Zum Login
          </Button>
        </Form>
      </StyledPaper>

      {/* Snackbar zur Anzeige von Erfolgsmeldung */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert severity="success" onClose={() => setSnackbarOpen(false)}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default ForgetPassword;
