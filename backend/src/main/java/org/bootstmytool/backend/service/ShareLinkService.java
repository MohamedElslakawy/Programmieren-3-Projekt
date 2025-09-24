package org.bootstmytool.backend.service;

// ShareLinkService – Dienst zur Verwaltung von geteilten Notiz-Links

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;

import org.bootstmytool.backend.model.Note;
import org.bootstmytool.backend.model.NoteShareLink;
import org.bootstmytool.backend.repository.NoteShareLinkRepository;
import org.springframework.stereotype.Service;

/**
 * @Author Mohamed Elslakawy
 * @Version 1.0
 * @Date: 2025-09-24
 *
 * Dieser Service bietet Funktionen zur Erstellung und Validierung von Freigabelinks für Notizen.
 */
@Service
public class ShareLinkService {

    // Sichere Zufallsquelle zur Generierung von Tokens
    private final SecureRandom secureRandom = new SecureRandom();

    // Repository für den Zugriff auf gespeicherte Freigabelinks
    private final NoteShareLinkRepository repo;

    // Konstruktor mit Dependency Injection des Repositories
    public ShareLinkService(NoteShareLinkRepository repo) {
        this.repo = repo;
    }

    // Generiert ein sicheres, URL-kompatibles Token
    public String generateToken() {
        byte[] bytes = new byte[32];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    // Erstellt einen neuen Freigabelink für eine Notiz mit Ablaufzeit und Nutzungsanzahl
    public NoteShareLink createShareLink(long noteId, long ownerId, Duration ttl, Integer uses) {
        NoteShareLink link = new NoteShareLink();
        link.setToken(generateToken()); // Token generieren
        link.setNoteId(noteId); // Notiz-ID setzen
        link.setOwnerUserId(ownerId); // Besitzer-ID setzen
        link.setExpiresAt(Instant.now().plus(ttl)); // Ablaufzeit berechnen
        link.setRemainingUses(uses); // Maximale Nutzungen setzen
        link.setActive(true); // Link aktivieren
        return repo.save(link); // Link speichern
    }

    // Validiert ein Token und aktualisiert ggf. die verbleibenden Nutzungen
    public Optional<NoteShareLink> validate(String token) {
        return repo.findByTokenAndActiveTrue(token) // Nur aktive Links abrufen
                .filter(l -> l.getExpiresAt() == null || l.getExpiresAt().isAfter(Instant.now())) // Ablauf prüfen
                .map(l -> {
                    if (l.getRemainingUses() != null) {
                        l.setRemainingUses(l.getRemainingUses() - 1); // Nutzung reduzieren
                        if (l.getRemainingUses() <= 0) l.setActive(false); // Link deaktivieren, wenn keine Nutzung mehr übrig
                        repo.save(l); // Änderungen speichern
                    }
                    return l; // Gültigen Link zurückgeben
                });
    }
}
