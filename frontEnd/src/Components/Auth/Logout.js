/**
 * Author: Fighan Suliman
 * Version: 1.0
 * Datum: 24.09.2025
 *
 * Diese Klasse `Logout` ist eine React-Komponente, die einen Logout-Button
 * bereitstellt. Sie ermöglicht es dem Benutzer, sich aus der Anwendung abzumelden,
 * indem das gespeicherte Authentifizierungs-Token entfernt wird und eine Logout-Anfrage
 * an den Server gesendet wird. Nach dem Logout wird der Benutzer automatisch
 * zur Login-Seite weitergeleitet. Die Komponente nutzt das Logout-Icon von Material-UI
 * für die visuelle Darstellung des Buttons und React Router für die Navigation.
 */

// Importiere das Logout-Icon von MUI
import { Logout as LogoutIcon } from "@mui/icons-material";

// Importiere die `useNavigate`-Hook von React Router für das Routing
import { useNavigate } from "react-router-dom";

// Logout-Komponente
function Logout() {
    // `useNavigate` für die Navigation nach dem Logout
    const navigate = useNavigate();

    // Funktion, die beim Klicken auf den Logout-Button ausgeführt wird
    const handleLogout = () => {
        // Entfernt das Token aus dem lokalen Speicher
        localStorage.removeItem("token");

        // Sendet eine Logout-Anfrage an den Server
        fetch("/api/auth/logout", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}` // Token im Header der Anfrage senden
            }
        });

        // Navigiert den Benutzer zur Login-Seite nach erfolgreichem Logout
        navigate("/login");
    };

    return (
        // Button, der die Logout-Funktion ausführt
        <button onClick={handleLogout}>
            <LogoutIcon /> Logout
        </button>
    );
}

// Exportiere die Komponente für die Nutzung in anderen Dateien
export default Logout;
