package org.bootstmytool.backend.controller;

import java.time.Duration;
import java.util.Map;

import org.bootstmytool.backend.model.User;
import org.bootstmytool.backend.repository.UserRepository;
import org.bootstmytool.backend.service.ShareLinkService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * @Author: Mohamed Elslakawy
 * @Version: 1.0
 * @Date: 2025-09-24
 *
 * ShareController
 * - Erstellt Share-Links für Notizen (authentifizierte Nutzer)
 * - Nutzt den eingeloggten Benutzer (aus JWT) als Owner
 */
@RestController
@RequestMapping("/api/share")
public class ShareController {

    private final ShareLinkService service;
    private final UserRepository userRepository; // Repository als Bean injizieren (nicht static!)

    // Konstruktor-Injection (empfohlen)
    public ShareController(ShareLinkService service, UserRepository userRepository) {
        this.service = service;
        this.userRepository = userRepository;
    }

    /**
     * POST /api/share/{noteId}
     * Erzeugt einen Share-Link für eine Note.
     *
     * @param noteId       ID der Notiz
     * @param auth         aktueller Authentication-Context (aus JWT)
     * @return             Map mit der öffentlichen URL (z.B. "/share/<token>")
     */
    @PostMapping("/{noteId}")
    public Map<String, String> create(@PathVariable long noteId, Authentication auth) {
        // Besitzer (Owner) aus dem eingeloggten Benutzer ermitteln
        long ownerId = extractUserId(auth);

        // Link 2 Stunden gültig, unbegrenzte Nutzung (remainingUses = null)
        var link = service.createShareLink(noteId, ownerId, Duration.ofHours(2), null);

        // Nur Pfad zurückgeben; das Frontend baut die absolute URL (origin + path)
        return Map.of("url", "/share/" + link.getToken());
    }

    /**
     * Ermittelt die User-ID aus dem Authentication-Objekt.
     * Standard: auth.getName() liefert den Subject (meist E-Mail) aus dem JWT.
     */
    private long extractUserId(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            throw new RuntimeException("Unauthenticated");
        }

        // Annahme: JWT-Subject = E-Mail
        String email = auth.getName();

        // Nutzer per E-Mail laden (NICHT static aufrufen!)
        return userRepository.findByEmail(email)
                .map(User::getId)
                .orElseThrow(() -> new RuntimeException("User not found for email: " + email));
    }
}
