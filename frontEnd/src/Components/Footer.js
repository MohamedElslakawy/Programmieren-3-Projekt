/**
 * Author: Fighan Suliman
 * Version: 1.0
 * Datum: 24.09.2025
 *
 * Die `Footer` Komponente stellt den unteren Bereich der Webseite dar. Sie ist
 * immer am unteren Rand fixiert, zeigt Copyright-Informationen an und bleibt
 * beim Scrollen sichtbar. Das Design nutzt einfache Inline-Styles, um
 * Hintergrundfarbe, Textfarbe, Höhe und Zentrierung des Inhalts festzulegen.
 * Diese Komponente eignet sich als globaler Footer für die gesamte App.
 */

// Export der Footer-Komponente
export const Footer = () => {
  return (
    <div
      style={{
        position: "fixed",          // Footer immer fixiert am Bildschirm
        bottom: 0,                  // am unteren Rand
        left: 0,
        width: "100%",              // volle Breite
        textAlign: "center",        // zentrierter Text
        padding: "5px",
        backgroundColor: "#504b4b", // Hintergrundfarbe
        color: "#fff",              // Textfarbe weiß
        fontSize: "14px",
        height: "50px",             // feste Höhe
        display: "flex",            // Flexbox für Zentrierung
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h4 style={{ margin: 0 }}>© 2025 EduNotizen. All rights reserved.</h4>
    </div>
  );
};

// Default-Export
export default Footer;
