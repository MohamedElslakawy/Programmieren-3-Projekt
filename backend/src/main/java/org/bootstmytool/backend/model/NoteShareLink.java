package org.bootstmytool.backend.model;

// NoteShareLink-Entität zur Verwaltung von geteilten Notiz-Links

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

/**
 * @Author: Mohamed Elslakawy
 * @Version: 1.0
 * @Date: 2025-09-24
 *
 * Diese Entität repräsentiert einen Link zum Teilen einer Notiz.
 * Sie enthält Informationen über Token, Besitzer, Ablaufdatum und Nutzungsanzahl.
 */
@Entity
@Getter
@Setter
public class NoteShareLink {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // Primärschlüssel

    @Column(nullable = false, unique = true, length = 128)
    private String token; // Eindeutiges Token zum Teilen

    @Column(nullable = false)
    private Long noteId; // ID der geteilten Notiz

    @Column(nullable = false)
    private Long ownerUserId; // ID des Besitzers der Notiz

    private Instant expiresAt;     // Ablaufdatum des Links
    private Integer remainingUses; // Anzahl verbleibender Nutzungen (null = unbegrenzt)
    private boolean active = true; // Gibt an, ob der Link aktiv ist
}
