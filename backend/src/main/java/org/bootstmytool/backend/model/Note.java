package org.bootstmytool.backend.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * @Author: Mohamed Elslakawy
 * @Version: 1.0
 * @Date: 2025-09-24
 *
 * Die Note-Klasse stellt eine Notiz dar, die von einem Benutzer erstellt wurde.
 * Sie enthält Titel, Inhalt, Tags, optionale Kategorie/Typ (UC-6) sowie verknüpfte Bilder.
 * Eine Notiz gehört zu genau einem Benutzer (Viele-zu-Eins).
 */
@Getter
@Entity
@Table(name = "note")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Note {

    /** Eindeutige ID der Notiz */
    @Setter
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    /** Titel der Notiz */
    @Setter
    private String title;

    /** Inhalt/Beschreibung der Notiz */
    @Setter
    @Column(length = 4000) // <<< DAS IST DIE KORREKTUR: @Lob wurde entfernt
    private String content;

    /**
     * Liste der Tags, die der Notiz zugeordnet sind.
     * Hinweis: wird in einer separaten Collection-Table gespeichert.
     */
    @Setter
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "note_tags", joinColumns = @JoinColumn(name = "note_id"))
    private List<String> tags = new ArrayList<>();

    /**
     * Vordefinierte Kategorie (z.B. STUDIUM, ARBEIT, PRIVAT, SONSTIGES).
     * Speicherung als String, damit das DB-Schema lesbar bleibt.
     */
    @Setter
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private NoteCategory category = NoteCategory.SONSTIGES; // Standardwert

    /**
     * Art/Typ der Notiz (z.B. TEXT, TODO, LINK, BILD).
     * Ebenfalls als String gespeichert.
     */
    @Setter
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private NoteType type = NoteType.TEXT; // Standardwert

    /** Ersteller der Notiz (Viele Notizen gehören zu einem User) */
    @Setter
    @ManyToOne
    @JsonBackReference // verhindert rekursive Serialisierung
    private org.bootstmytool.backend.model.User user;

    /** Zugehörige Bilder (eine Notiz hat mehrere Bilder) */
    @Setter
    @OneToMany(mappedBy = "note", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JsonManagedReference // verwaltet die Kind-Objekte (Bilder)
    private List<Image> images = new ArrayList<>();

    /** Automatischer Zeitstempel bei Erstellung der Notiz */
    @Temporal(TemporalType.TIMESTAMP)
    @CreationTimestamp
    private Date createdAt;

    /** Standardkonstruktor (von JPA benötigt) */
    public Note() {}
}