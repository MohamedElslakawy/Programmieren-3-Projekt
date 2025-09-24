package org.bootstmytool.backend.controller;

import org.bootstmytool.backend.service.ShareLinkService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

/**
 * @Author: Mohamed Elslakawy
 * @Version: 1.0
 * @Date: 2025-09-24
 *
 * Dieser Controller verarbeitet Anfragen zum Teilen von Links
 * und leitet Benutzer abhängig vom Authentifizierungsstatus weiter.
 */
@Controller
public class ShareRedirectController {

    // Dienst zur Verarbeitung von Freigabelinks
    private final ShareLinkService service;

    // Konstruktor zur Initialisierung des Dienstes über Dependency Injection
    public ShareRedirectController(ShareLinkService service) {
        this.service = service;
    }

    // HTTP-GET-Endpunkt zum Öffnen eines geteilten Links anhand eines Tokens
    @GetMapping("/share/{token}")
    public ResponseEntity<Object> open(
            @PathVariable String token, // Extrahiert das Token aus der URL
            @AuthenticationPrincipal Object user) { // Authentifizierter Benutzer wird automatisch über Spring Security bereitgestellt

        // Wenn kein Benutzer authentifiziert ist, erfolgt eine Weiterleitung zur Login-Seite
        if (user == null) {
            return ResponseEntity.status(302)
                    .header("Location", "/login?redirect=/share/" + token)
                    .build();
        }

        // Validiert das Token und leitet zum entsprechenden Notizinhalt weiter, falls gültig
        return service.validate(token)
                .map(l -> ResponseEntity.status(302)
                        .header("Location", "/notes" + l.getNoteId())
                        .build())
                // Falls das Token ungültig ist, wird ein 404-Fehler zurückgegeben
                .orElseGet(() -> ResponseEntity.status(404).build());
    }
}
