/**
 * Author: Fighan Suliman
 * Version: 1.0
 * Datum: 24.09.2025
 *
 * Die `ResetPassword` Komponente ist eine React-Komponente, die es dem Benutzer
 * ermöglicht, sein Passwort zurückzusetzen. Sie bietet zwei Eingabefelder für
 * das neue Passwort und die Passwortbestätigung. Die Komponente prüft, ob die
 * Passwörter übereinstimmen und die Mindestlänge von 6 Zeichen erfüllen. Nach
 * erfolgreicher Passwortänderung wird eine Erfolgsnachricht angezeigt und der
 * Benutzer nach kurzer Zeit automatisch zur Login-Seite weitergeleitet. Die
 * Komponente verwendet Material-UI für das Layout und Icons, um die
 * Passwortsichtbarkeit umzuschalten.
 */

import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Box, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';  // Icons für das Umschalten der Sichtbarkeit
import { resetPassword } from '../../api';
import { useNavigate } from 'react-router-dom'; // useNavigate für die Navigation verwenden

const ResetPassword = () => {
  // State für das neue Passwort
  const [newPassword, setNewPassword] = useState('');
  // State für Passwortbestätigung
  const [confirmPassword, setConfirmPassword] = useState('');
  // State für Fehlermeldungen
  const [error, setError] = useState('');
  // State für Erfolgsmeldungen
  const [success, setSuccess] = useState('');
  // State für die Sichtbarkeit des Passworts
  const [showPassword, setShowPassword] = useState(false);  
  // Hook für Navigation
  const navigate = useNavigate(); 

  // Handler für das Absenden des Formulars
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    // Überprüfung, ob die Passwörter übereinstimmen
    if (newPassword !== confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      return;
    }

    // Überprüfung der Mindestlänge des Passworts
    if (newPassword.length < 6) {
      setError('Passwort muss mindestens 6 Zeichen lang sein');
      return;
    }

    // API-Aufruf zur Passwortzurücksetzung
    const response = await resetPassword(newPassword);

    // Erfolgsfall
    if (response === "Passwort erfolgreich zurückgesetzt") {
      setSuccess("Bitte melden Sie sich mit Ihrem neuen Passwort an");
      // Automatische Weiterleitung zur Login-Seite nach 2 Sekunden
      setTimeout(() => navigate('/login'), 2000); 
    } else {
      // Fehlerfall: falls response oder response.data nicht vorhanden ist
      setError(response?.data?.error || "Unbekannter Fehler. Bitte versuchen Sie es später erneut.");
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mt: 8,
        }}
      >
        <Typography variant="h5">Passwort zurücksetzen</Typography>

        <form onSubmit={handleSubmit} style={{ width: '100%', marginTop: '1em' }}>
          {/* Eingabe für das neue Passwort */}
          <TextField
            label="Neues Passwort"
            variant="outlined"
            type={showPassword ? 'text' : 'password'}  // Sichtbarkeit des Passworts umschalten
            fullWidth
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={{ marginBottom: '1em' }}
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}  // Umschalten der Passwortsichtbarkeit
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />} {/* Sichtbarkeitssymbol */}
                </IconButton>
              ),
            }}
          />

          {/* Eingabe für Passwort-Bestätigung */}
          <TextField
            label="Passwort bestätigen"
            variant="outlined"
            type={showPassword ? 'text' : 'password'}  // Sichtbarkeit des Passworts umschalten
            fullWidth
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ marginBottom: '1em' }}
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}  // Umschalten der Passwortsichtbarkeit
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />} {/* Sichtbarkeitssymbol */}
                </IconButton>
              ),
            }}
          />

          {/* Absenden-Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            style={{ marginBottom: '1em' }}
          >
            Passwort zurücksetzen
          </Button>
        </form>

        {/* Erfolgs- oder Fehlermeldungen */}
        {success && <Typography color="green">{success}</Typography>}
        {error && <Typography color="red">{error}</Typography>}
      </Box>
    </Container>
  );
};

export default ResetPassword;
