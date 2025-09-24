package org.bootstmytool.backend.controller;

import java.util.Map;
import java.util.HashMap;

import org.bootstmytool.backend.service.ShareLinkService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * @Author: Mohamed Elslakawy
 * @Version: 1.0
 * @Date: 2025-09-24
 *
 * Dieser Controller stellt eine API bereit, um geteilte Links zu validieren
 * und die zugehörige Notiz-ID als JSON-Antwort zurückzugeben.
 */
@RestController
@RequestMapping("/api/share")
public class ShareResolveController {

    // Dienst zur Validierung von Freigabelinks
    private final ShareLinkService service;

    // Konstruktor zur Initialisierung des Dienstes über Dependency Injection
    public ShareResolveController(ShareLinkService service) {
        this.service = service;
    }

    // HTTP-GET-Endpunkt zur Auflösung eines Tokens und Rückgabe der Notiz-ID
    @GetMapping("/{token}")
    public ResponseEntity<?> resolve(@PathVariable String token) {
        return service.validate(token)
                .map(l -> {
                    // Antwortkörper mit der Notiz-ID bei erfolgreicher Validierung
                    Map<String, Object> body = new HashMap<>();
                    body.put("noteId", l.getNoteId()); // Gibt einen Long-Wert zurück
                    return ResponseEntity.ok(body);
                })
                .orElseGet(() -> {
                    // Fehlerantwort bei ungültigem oder abgelaufenem Token
                    Map<String, Object> err = new HashMap<>();
                    err.put("error", "invalid_or_expired");
                    return ResponseEntity.status(404).body(err);
                });
    }
}
