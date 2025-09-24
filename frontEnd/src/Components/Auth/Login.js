/**
 * Author: Fighan Suliman
 * Version: 1.0
 * Date: 24.09.2025
 *
 * Diese React-Komponente implementiert ein Login-Formular mit modernem Material-UI Design. 
 * Nutzer können ihre Zugangsdaten (E-Mail und Passwort) eingeben und werden nach erfolgreicher 
 * Authentifizierung in die Anwendung weitergeleitet. Die Komponente validiert Eingaben, zeigt 
 * Fehlermeldungen an, speichert das JWT-Token im lokalen Speicher und dekodiert es, um die 
 * Benutzerdaten zu extrahieren. Ein Snackbar-System informiert den Benutzer über Erfolg oder 
 * Fehlschläge beim Login. Zusätzlich gibt es Links für die Registrierung und Passwort-Zurücksetzung.
 */

import {
  Alert,
  Button,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import { styled } from '@mui/system';
import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import { FaEye, FaEyeSlash, FaLock, FaUser } from 'react-icons/fa';
import { NavLink, useNavigate } from 'react-router-dom';
import { loginUser } from '../../api';
import { useAuth } from '../../context/AuthContext';

// Styled Components für das Design von Paper und Formular
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: '400px',
  margin: 'auto',
  marginTop: theme.spacing(2),
  borderRadius: '12px',
  boxShadow: '0 3px 10px rgba(0, 0, 0, 0.2)',
  position: 'relative',
  overflow: 'hidden',
}));

// Styling für das Formular
const StyledForm = styled('form')(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(1),
}));

// Dekoratives Hintergrund-Blob
const Blob = styled('div')({
  position: 'absolute',
  top: '-50px',
  left: '-50px',
  width: '280px',
  height: '220px',
  background: 'linear-gradient(135deg, #1E90FF, #4169E1)',
  borderRadius: '50%',
  zIndex: 0,
});

// Styling für Eingabefelder
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#1E90FF',
      borderWidth: '2px',
    },
    '&:hover fieldset': {
      borderColor: '#4169E1',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1E90FF',
    },
  },
  '& .MuiInputBase-input': {
    padding: '10px',
  },
}));

// Styling für den Login-Button
const StyledButton = styled(Button)(({ theme }) => ({
  mt: 3,
  mb: 2,
  height: '50px',
  borderRadius: '8px',
  textTransform: 'none',
  fontSize: '18px',
  background: 'linear-gradient(90deg, #1E90FF, #4169E1)',
  '&:hover': {
    background: 'linear-gradient(90deg, #4169E1, #1E90FF)',
  },
}));

// Hauptkomponente: Login
export function Login() {
  // States für Formulardaten, Fehler, Passwortanzeige und Snackbar
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState('success');
  const navigate = useNavigate();
  const { setUser } = useAuth();

  // Prüfen, ob ein Token existiert und es ggf. dekodieren
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        console.log('Decoded token:', decodedToken);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  // Schließen der Snackbar
  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };

  // Eingaben in State speichern und Fehler zurücksetzen
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Login-Formular absenden
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validierung
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email ist erforderlich';
    if (!formData.password) newErrors.password = 'Passwort ist erforderlich';
    else if (formData.password.length < 6) newErrors.password = 'Passwort muss mindestens 6 Zeichen lang sein';

    // Fehler anzeigen, falls vorhanden
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Daten vorbereiten
    const dataToSubmit = {
      email: formData.email.toLowerCase(),
      password: formData.password,
    };

    try {
      // API-Call für Login
      const data = await loginUser(dataToSubmit);

      if (data.success) {
        // Token speichern und Benutzer setzen
        localStorage.setItem('token', data.token);
        const decodedUser = jwtDecode(data.token);
        const email = decodedUser.sub.split('@')[0];
        setUser({ token: data.token, email: email ?? '' });

        // Erfolgsmeldung anzeigen
        setSnackbarMessage('Login erfolgreich!');
        setSnackbarType('success');
        setOpenSnackbar(true);

        // Weiterleitung nach kurzer Wartezeit
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        throw new Error('Ungültige Anmeldedaten');
      }
    } catch (error) {
      // Fehlermeldung anzeigen
      console.error('Fehler beim Login:', error);
      setSnackbarMessage('Login fehlgeschlagen! Bitte versuche es später erneut.');
      setSnackbarType('error');
      setOpenSnackbar(true);
    }
  };

  // Umschalten der Passwortsichtbarkeit
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // JSX-Rendering
  return (
    <Container component="main" maxWidth="sm">
      <Grid container justifyContent="center" alignItems="center">
        <Grid item>
          <StyledPaper height="100%" style={{ paddingTop: "10rem", paddingBottom: "5rem" }} elevation={6}>
            <Blob />
            <Typography
              component="h1"
              variant="h4"
              gutterBottom
              textAlign="center"
              style={{ position: 'absolute', left: "1rem", top: "1rem", zIndex: 1, color: '#fff' }}
            >
              Login
            </Typography>
            <StyledForm onSubmit={handleSubmit} noValidate>
              {/* Eingabefeld Email */}
              <StyledTextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="off"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FaUser />
                    </InputAdornment>
                  ),
                }}
              />
              {/* Eingabefeld Passwort */}
              <StyledTextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FaLock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton aria-label="toggle password visibility" onClick={togglePasswordVisibility} edge="end">
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {/* Login-Button */}
              <StyledButton type="submit" fullWidth variant="contained" style={{ color: '#fff' }}>
                Login
              </StyledButton>
              {/* Link: Passwort vergessen */}
              <Grid container justifyContent="center">
                <Grid item>
                  <NavLink to="/forgot-password" style={{ textDecoration: 'none' }}>
                    <Typography variant="body2" color="primary">
                      Forgot Password?
                    </Typography>
                  </NavLink>
                </Grid>
              </Grid>
              {/* Link: Registrieren */}
              <Grid container justifyContent="center">
                <Grid item>
                  <NavLink to="/register" style={{ textDecoration: 'none' }}>
                    <Typography variant="body2" color="primary">
                      Don’t have an account? Sign Up
                    </Typography>
                  </NavLink>
                </Grid>
              </Grid>
            </StyledForm>
          </StyledPaper>
        </Grid>
      </Grid>
      {/* Snackbar für Feedback */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarType}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Login;
