import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import { resolveShare } from "../../api";

/**
 * @Author: Mohamed Elslakawy
 * @Version: 1.0
 * @Date: 2025-09-24
 *
 * Diese Komponente verarbeitet geteilte Links mit einem Token.
 * Sie versucht, die zugehörige Notiz zu laden und leitet den Benutzer entsprechend weiter.
 */
export default function ShareGateway() {
  const { token } = useParams(); // Extrahiert das Token aus der URL
  const navigate = useNavigate(); // Ermöglicht Navigation zu anderen Seiten

  useEffect(() => {
    let mounted = true; // Flag zur Vermeidung von Navigation nach dem Unmount

    const go = async () => {
      try {
        const data = await resolveShare(token); // Anfrage zur Auflösung des Tokens (erwartet { noteId: ... })
        if (!mounted) return; // Abbruch, falls Komponente nicht mehr gemountet ist
        if (data?.noteId) {
          navigate(`/notes/${data.noteId}`); // Weiterleitung zur Notizseite bei gültigem Token
        } else {
          navigate("/login"); // Weiterleitung zur Login-Seite bei ungültigem Token
        }
      } catch (err) {
        console.error("Resolve share error:", err); // Fehlerprotokollierung
        if (mounted) navigate("/login"); // Fehlerfall: Weiterleitung zur Login-Seite
      }
    };

    go(); // Startet die Token-Auflösung beim Laden der Komponente
    return () => {
      mounted = false; // Setzt das Flag beim Unmount
    };
  }, [token, navigate]); // Effekt wird erneut ausgeführt, wenn sich das Token oder die Navigation ändert

  // Anzeige eines Ladezustands während der Verarbeitung
  return (
    <Box
      sx={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
      }}
    >
      <CircularProgress /> {/* Ladeindikator */}
      <Typography variant="body1">Bitte warten…</Typography> {/* Hinweistext */}
    </Box>
  );
}