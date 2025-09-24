# EduNotizen - Vollständige API-Dokumentation

## Projektübersicht

**Autor:** Fighan Suliman  
**Version:** 1.0  
**Datum:** 24. September 2025  
**Backend-URL:** `http://localhost:8080`  
**Frontend-Port:** `3000`

EduNotizen ist eine vollständige React-Webanwendung für die Verwaltung von Notizen mit Bildunterstützung, Authentifizierung und Sharing-Funktionalitäten.

---

## Technologie-Stack

### Frontend
- **React** 18.2.0
- **Material-UI** 6.2.0 (UI-Komponenten)
- **React Router** 7.0.2 (Navigation)
- **Axios** 1.7.9 (HTTP-Client)
- **JWT-Decode** 4.0.0 (Token-Dekodierung)
- **React Icons** 5.4.0

### Backend-Integration
- RESTful API
- JWT-Authentifizierung
- Multipart-Datei-Upload
- Token-basierte Autorisierung

---

## Architektur

### Komponentenstruktur
```
src/
├── App.js                    # Hauptkomponente mit Theme & Routing
├── RouteList.js              # Zentrale Route-Definitionen
├── api.js                    # Zentrale API-Funktionen
├── context/
│   └── AuthContext.js        # Globaler Authentifizierungs-Context
├── Components/
│   ├── Home.js               # Dashboard mit Notizenliste
│   ├── Navbar.js             # Navigation mit Suche
│   ├── Footer.js             # Footer-Komponente
│   ├── UserProfile.js        # Benutzerprofil
│   ├── ProtectedRoute.js     # Route-Schutz
│   ├── Auth/                 # Authentifizierungs-Komponenten
│   │   ├── Login.js
│   │   ├── Register.js
│   │   ├── ForgetPassword.js
│   │   ├── ResetPassword.js
│   │   ├── ShareGateway.js
│   │   └── Logout.js
│   └── Notes/                # Notizen-Verwaltung
│       ├── AddNote.js
│       ├── EditNote.js
│       ├── NoteList.js
│       ├── NoteCard.js
│       ├── SearchBar.js
│       └── FilterBar.js
```

---

## API-Endpunkte

### 🔐 Authentifizierung

#### **POST** `/api/auth/login`
**Beschreibung:** Benutzer-Anmeldung

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (Erfolg):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Login erfolgreich"
}
```

**Implementierung:** `Login.js`
- Formularvalidierung (E-Mail-Format, Passwortlänge)
- JWT-Token-Speicherung im localStorage
- Automatische Weiterleitung zur Startseite
- Snackbar-Feedback

---

#### **POST** `/api/auth/register`
**Beschreibung:** Benutzer-Registrierung

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123"
}
```

**Response (Erfolg):**
```json
{
  "success": true,
  "message": "Registrierung erfolgreich"
}
```

**Implementierung:** `Register.js`
- Passwort-Bestätigung
- E-Mail-Validierung
- Sichtbarkeits-Toggle für Passwörter
- Automatische Login-Weiterleitung

---

#### **POST** `/api/auth/verify`
**Beschreibung:** Benutzer-Verifikation für Passwort-Reset

**Request Body:**
```json
{
  "email": "user@example.com",
  "nameLength": "12"
}
```

**Response (Erfolg):**
```json
{
  "success": true,
  "token": "reset-token-here",
  "message": "Verifikation erfolgreich"
}
```

**Sicherheitsfrage:** Anzahl der Buchstaben vor dem "@"-Symbol

**Implementierung:** `ForgetPassword.js`
- Zwei-Faktor-Authentifizierung über Sicherheitsfrage
- Token-Speicherung für Reset-Prozess
- Zeitgesteuerte Navigation

---

#### **POST** `/api/auth/reset-password`
**Beschreibung:** Passwort zurücksetzen

**Request Body:**
```json
{
  "newPassword": "newpassword123"
}
```

**Query Parameter:**
- `token`: Reset-Token aus Verifikation

**Response (Erfolg):**
```json
{
  "success": true,
  "message": "Passwort erfolgreich zurückgesetzt"
}
```

**Implementierung:** `ResetPassword.js`
- Passwort-Bestätigung
- Mindestlänge-Validierung
- Sichtbarkeits-Toggle

---

### 📝 Notizen-Verwaltung

#### **GET** `/notes/get`
**Beschreibung:** Alle Notizen des Benutzers abrufen

**Authorization:** Bearer Token erforderlich

**Response:**
```json
[
  {
    "id": 1,
    "title": "Meine Notiz",
    "content": "Notizinhalt hier...",
    "tags": ["studium", "wichtig"],
    "category": "STUDIUM",
    "type": "TEXT",
    "createdAt": "2025-09-24T10:30:00Z",
    "images": [
      {
        "id": 1,
        "url": "http://localhost:8080/images/image1.jpg",
        "filename": "image1.jpg"
      }
    ]
  }
]
```

**Implementierung:** `Home.js`
- Token-Validierung mit JWT-Dekodierung
- Clientseitige Filter (Suche, Kategorie, Typ, Datum)
- Tag-basierte Filter
- Responsive Grid-Layout

---

#### **POST** `/notes/create`
**Beschreibung:** Neue Notiz erstellen

**Content-Type:** `multipart/form-data`

**Form Data:**
- `title`: Titel der Notiz
- `description`: Hauptinhalt
- `content`: Inhalt (Kompatibilität)
- `tags`: Tags als String
- `category`: Kategorie-Enum
- `type`: Typ-Enum
- `images`: Bilddateien (mehrere möglich)

**Response:**
```json
{
  "success": true,
  "noteId": 123,
  "message": "Notiz erfolgreich erstellt"
}
```

**Implementierung:** `AddNote.js`
- Multipart-Datei-Upload
- Bildvorschau mit URL.createObjectURL
- Enum-Validierung für Kategorie/Typ
- Dateigröße-Begrenzung (2MB)

**Kategorie-Optionen:**
- `STUDIUM`
- `ARBEIT` 
- `PRIVAT`
- `SONSTIGES`

**Typ-Optionen:**
- `TEXT`
- `TODO`
- `IMAGE`
- `LINK`
- `DOKUMENT`

---

#### **PUT** `/notes/edit/{noteId}`
**Beschreibung:** Notiz bearbeiten

**Path Parameter:** `noteId`

**Request Body:**
```json
{
  "title": "Aktualisierter Titel",
  "content": "Aktualisierter Inhalt",
  "tags": "tag1,tag2",
  "category": "ARBEIT",
  "type": "TEXT"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notiz erfolgreich aktualisiert"
}
```

**Implementierung:** `EditNote.js`
- Laden vorhandener Daten
- Separate Bildverwaltung
- Partielle Updates möglich

---

#### **DELETE** `/notes/delete/{noteId}`
**Beschreibung:** Notiz löschen

**Path Parameter:** `noteId`

**Response:**
```json
{
  "success": true,
  "message": "Notiz erfolgreich gelöscht"
}
```

**Implementierung:** `NoteCard.js` (Delete-Button)
- Sofortiges UI-Update
- Bestätigungsdialog

---

#### **GET** `/notes/get/{noteId}`
**Beschreibung:** Einzelne Notiz abrufen

**Path Parameter:** `noteId`

**Response:**
```json
{
  "id": 1,
  "title": "Einzelne Notiz",
  "content": "Notizinhalt...",
  "tags": ["tag1", "tag2"],
  "category": "STUDIUM",
  "type": "TEXT",
  "createdAt": "2025-09-24T10:30:00Z"
}
```

---

#### **GET** `/notes/search/{searchTerm}`
**Beschreibung:** Notizen durchsuchen

**Path Parameter:** `searchTerm` (URL-kodiert)

**Response:** Array von Notizen (wie `/notes/get`)

**Implementierung:** Clientseitig in `Home.js`
- Suche in Titel und Inhalt
- Echtzeit-Filter ohne Server-Request

---

#### **GET** `/notes/filter`
**Beschreibung:** Gefilterte Notizen abrufen

**Query Parameter:**
- `q`: Suchbegriff
- `category`: Kategorie-Filter
- `type`: Typ-Filter
- `from`: Startdatum (ISO String)
- `to`: Enddatum (ISO String)

**Beispiel:** `/notes/filter?category=STUDIUM&type=TEXT&from=2025-09-01T00:00:00Z`

**Implementierung:** `FilterBar.js`
- Kombinierbare Filter
- Datums-Range-Picker

---

### 🖼️ Bild-Verwaltung

#### **GET** `/image/note/{noteId}`
**Beschreibung:** Bilder einer Notiz abrufen

**Path Parameter:** `noteId`

**Response:**
```json
[
  {
    "id": 1,
    "url": "http://localhost:8080/images/image1.jpg",
    "filename": "image1.jpg",
    "noteId": 1
  }
]
```

**Implementierung:** `EditNote.js`, `NoteCard.js`
- Automatisches Laden beim Notiz-Abruf
- Grid-Layout für Bildanzeige

---

#### **POST** `/image/{noteId}/images`
**Beschreibung:** Bilder zu Notiz hinzufügen

**Path Parameter:** `noteId`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `image`: Bilddateien (mehrere)

**Response:**
```json
{
  "success": true,
  "uploadedImages": 3,
  "message": "Bilder erfolgreich hochgeladen"
}
```

**Implementierung:** `AddNote.js`, `EditNote.js`
- Drag & Drop Upload
- Bildvorschau vor Upload
- Dateityp-Validierung

---

#### **DELETE** `/image/delete/{imageId}`
**Beschreibung:** Bild löschen

**Path Parameter:** `imageId`

**Response:**
```json
{
  "success": true,
  "message": "Bild erfolgreich gelöscht"
}
```

**Implementierung:** `EditNote.js`
- Sofortiges UI-Update
- Bestätigungsdialog

---

### 🔗 Share-Funktionen

#### **POST** `/api/share/{noteId}`
**Beschreibung:** Share-Link für Notiz erstellen

**Path Parameter:** `noteId`

**Response:**
```json
{
  "success": true,
  "url": "/share/abc123token",
  "token": "abc123token",
  "expiresAt": "2025-10-24T10:30:00Z"
}
```

**Implementierung:** `NoteCard.js`
- Automatisches Kopieren in Zwischenablage
- Vollständige URL-Generierung
- Snackbar-Feedback

---

#### **GET** `/api/share/resolve/{token}`
**Beschreibung:** Share-Token auflösen

**Path Parameter:** `token`

**Response:**
```json
{
  "success": true,
  "noteId": 123,
  "note": {
    "title": "Geteilte Notiz",
    "content": "Öffentlicher Inhalt..."
  }
}
```

**Implementierung:** `ShareGateway.js`
- Öffentlicher Zugriff (kein Auth-Token)
- Automatische Weiterleitung
- Fehlerbehandlung für ungültige Token

---

## Frontend-Komponenten im Detail

### 🏠 Home-Komponente

**Datei:** `Home.js`

**Hauptfunktionen:**
- **Notizen-Dashboard:** Grid-Layout mit responsiven Karten
- **Echtzeit-Suche:** Clientseitige Filter ohne Server-Requests
- **Tag-Pills:** Klickbare Tags für schnelle Filter
- **Multi-Filter:** Kategorie, Typ, Datumsbereich kombinierbar
- **Erweiterbarer Inhalt:** "Mehr anzeigen" für lange Texte
- **Sofort-Aktionen:** Löschen, Bearbeiten, Teilen

**State-Management:**
```javascript
const [notes, setNotes] = useState([]);
const [filteredNotes, setFilteredNotes] = useState([]);
const [expandedNoteIds, setExpandedNoteIds] = useState([]);
const [selectedTag, setSelectedTag] = useState(null);
```

**Filter-Logik:**
- Freitext-Suche in Titel und Inhalt
- Tag-basierte Filterung
- Kategorie/Typ-Enums
- Zeitraum-Filter mit Date-Range

---

### 🔐 Authentifizierungs-System

#### AuthContext (`AuthContext.js`)

**Funktionen:**
- **JWT-Token-Management:** Automatische Prüfung und Dekodierung
- **Globaler Benutzer-State:** Verfügbar in allen Komponenten
- **Token-Expiration:** Automatisches Logout bei abgelaufenen Token
- **Snackbar-System:** Zentrale Benachrichtigungen

**Context-Provider:**
```javascript
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState("");
};
```

#### ProtectedRoute (`ProtectedRoute.js`)

**Route-Schutz:**
- Prüfung des eingeloggten Benutzers
- Automatische Login-Weiterleitung
- Schutz für `/add-note`, `/edit-note/:id`

---

### 📱 Navigation System

#### Navbar (`Navbar.js`)

**Features:**
- **Responsive Design:** Desktop und Mobile-Ansichten
- **Suchintegration:** SearchBar für Desktop
- **Dark-Mode-Toggle:** Persistente Einstellungen
- **Mobile Drawer:** Ausklappbare Navigation für Smartphones
- **Benutzer-Avatar:** Dynamische Initialen
- **Schnellaktionen:** "Neue Notiz", Logout

**Mobile-Optimierung:**
- Hamburger-Menü
- Touch-optimierte Buttons
- Gestapelte Layout-Elemente

---

### 📝 Notizen-Editor-System

#### AddNote (`AddNote.js`)

**Formular-Features:**
- **Rich-Text-Eingabe:** Mehrzeiliger Content-Editor
- **Enum-Dropdowns:** Kategorie und Typ-Auswahl
- **Multi-Image-Upload:** Drag & Drop mit Vorschau
- **Tag-System:** Komma-getrennte Tags
- **Validierung:** Client- und Server-seitig

**Bild-Upload-Workflow:**
1. Dateiauswahl (multiple)
2. Größenvalidierung (max 2MB)
3. Typ-Prüfung (nur Bilder)
4. Vorschau-Generierung
5. FormData-Upload
6. Progress-Feedback

#### EditNote (`EditNote.js`)

**Bearbeitung-Features:**
- **Bestehende Daten laden:** API-Abruf per ID
- **Separate Bildverwaltung:** Löschen/Hinzufügen getrennt
- **Partielle Updates:** Nur geänderte Felder senden
- **Bildvorschau:** Bestehende und neue Bilder

---

### 🎨 UI/UX-Komponenten

#### NoteCard (`NoteCard.js`)

**Karten-Features:**
- **Bildergalerie:** Responsive Grid-Layout
- **Expandable Content:** Ausklappbare lange Texte
- **Aktions-Buttons:** Share, Edit, Delete
- **Detail-Modal:** Vollansicht mit großen Bildern
- **Tag-Chips:** Visuelle Tag-Darstellung

**Share-Funktionalität:**
```javascript
const handleShare = async (id) => {
  const data = await createShareLink(id);
  const shareUrl = window.location.origin + data.url;
  await navigator.clipboard.writeText(shareUrl);
};
```

#### FilterBar (`FilterBar.js`)

**Filter-Optionen:**
- **Freitext-Suche:** Titel/Content-Durchsuchung
- **Kategorie-Dropdown:** Enum-basierte Auswahl
- **Typ-Filter:** Notiz-Typ-Einschränkung
- **Datums-Range:** Von/Bis-Auswahl
- **Reset-Funktion:** Alle Filter zurücksetzen

---

## API-Client-Architektur

### Zentrale API-Datei (`api.js`)

**Features:**
- **Axios-Instanz:** Konfigurierte HTTP-Client
- **Token-Management:** Automatische Header-Setzung
- **Fehlerbehandlung:** Zentrale Error-Handler
- **Request-Wrapper:** Einheitliche API-Calls
- **Auth-Free-Routes:** Login/Register ohne Token

**Token-Validierung:**
```javascript
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const { exp } = jwtDecode(token);
    const now = Math.floor(Date.now() / 1000);
    return exp < now;
  } catch {
    return true;
  }
};
```

**API-Call-Wrapper:**
```javascript
const makeApiCall = async (method, url, data = null, config = {}) => {
  const isAuthFree = url.startsWith("/api/auth/login") || 
                     url.startsWith("/api/auth/register") ||
                     url.startsWith("/api/auth/verify") ||
                     url.startsWith("/api/auth/reset-password");

  if (!isAuthFree) {
    ensureAuthHeaderOrThrow();
  }
  // ... Request-Logik
};
```

---

## Sicherheitsaspekte

### 🔒 Authentifizierung & Autorisierung

1. **JWT-Token-System:**
   - Token im localStorage
   - Automatische Expiration-Prüfung
   - Header-basierte Übertragung

2. **Route-Protection:**
   - ProtectedRoute-Wrapper
   - Token-Validierung vor Zugriff
   - Automatische Login-Weiterleitung

3. **Passwort-Sicherheit:**
   - Mindestlänge-Validierung
   - Sichtbarkeits-Toggle
   - Bestätigungs-Felder

4. **Zwei-Faktor-Reset:**
   - Sicherheitsfrage-System
   - Token-basierter Reset-Prozess
   - Zeitlich begrenzte Token

### 🛡️ Input-Validierung

1. **Client-seitig:**
   - E-Mail-Format-Prüfung
   - Passwort-Stärke-Validierung
   - Dateigröße-Limits
   - Typ-Validierung

2. **Server-Integration:**
   - Request-Body-Validierung
   - Authorization-Header-Prüfung
   - Datei-Upload-Sicherheit

---

## Performance-Optimierungen

### ⚡ Frontend-Optimierungen

1. **React-Optimierungen:**
   - `React.memo` für NoteList
   - `useMemo` für Filter-Berechnungen
   - Lazy Loading für Bilder

2. **API-Optimierungen:**
   - Axios-Request-Caching
   - AbortController für Request-Cancellation
   - Batch-Image-Uploads

3. **State-Management:**
   - Lokaler State für Filter
   - Context für globale Auth-Daten
   - Optimistische UI-Updates

### 🎯 UX-Verbesserungen

1. **Loading-States:**
   - CircularProgress für API-Calls
   - Skeleton-Loading für Karten
   - Progress-Bars für Uploads

2. **Feedback-System:**
   - Snackbar für Erfolg/Fehler
   - Toast-Notifications
   - Error-Boundaries

3. **Responsive Design:**
   - Mobile-First-Ansatz
   - Touch-optimierte Buttons
   - Adaptive Layouts

---

## Installation & Setup

### Voraussetzungen
- Node.js >= 16.0
- npm oder yarn
- Backend-Server auf Port 8080

### Installation
```bash
# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm start

# Production-Build erstellen
npm run build

# Tests ausführen
npm test
```

### Umgebungsvariablen
```env
REACT_APP_API_URL=http://localhost:8080
REACT_APP_ENV=development
```

---

## Testing-Strategien

### Unit-Tests
- Komponenten-Rendering
- API-Funktionen
- Utility-Helpers
- Form-Validierung

### Integration-Tests
- User-Flows
- API-Integration
- Route-Navigation
- Auth-Workflows

### E2E-Tests
- Vollständige Benutzer-Szenarien
- Cross-Browser-Testing
- Mobile-Responsiveness

---

## Deployment

### Production-Build
```bash
npm run build
```

### Docker-Container
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Umgebungs-Konfiguration
- Production-API-URLs
- HTTPS-Konfiguration
- CDN-Integration für Assets

---

## Troubleshooting

### Häufige Probleme

1. **Token-Expiration:**
   - Automatisches Logout implementiert
   - Refresh-Token-Mechanismus möglich

2. **CORS-Probleme:**
   - Backend-Konfiguration prüfen
   - Proxy-Setup für Development

3. **Image-Upload-Fehler:**
   - Dateigröße-Limits prüfen
   - Content-Type-Headers validieren

4. **Route-Protection:**
   - Token-Validierung in ProtectedRoute
   - AuthContext-Provider korrekt eingebunden

---

## Zukunftige Erweiterungen

### Geplante Features
1. **Real-time Updates:** WebSocket-Integration
2. **Offline-Support:** Service Worker + Cache
3. **Collaboration:** Multi-User-Editing
4. **Advanced Search:** Full-Text-Search mit Elasticsearch
5. **Mobile App:** React Native Version
6. **Cloud Storage:** S3/CloudFront-Integration

### API-Erweiterungen
1. **Versionierung:** API v2 mit Breaking Changes
2. **GraphQL:** Alternative zu REST
3. **Webhooks:** Event-basierte Benachrichtigungen
4. **Rate Limiting:** API-Usage-Controls

---

## Support & Dokumentation

### Kontakt
- **Entwickler:** Fighan Suliman
- **E-Mail:** [kontakt@edunotizen.de]
- **GitHub:** [github.com/fighan-suliman/edunotizen]

### Dokumentation
- **API-Docs:** [docs.edunotizen.de/api]
- **User-Guide:** [docs.edunotizen.de/guide]
- **Changelog:** [docs.edunotizen.de/changelog]

---

*Diese Dokumentation wird kontinuierlich aktualisiert und entspricht dem aktuellen Stand der Entwicklung (Version 1.0, September 2025).*