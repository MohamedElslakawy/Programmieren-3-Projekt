package org.bootstmytool.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.bootstmytool.backend.model.Note;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Objects;

/**
 * @Author: Mohamed Elslakawy
 * @Version: 1.0
 * @Date: 2025-09-24
 *
 * NoteDTO (Data Transfer Object) wird zum Transport von Notiz-Daten zwischen
 * Schichten verwendet. Enthält Basisinformationen wie Titel, Inhalt, Tags,
 * sowie (NEU) Kategorie und Typ gemäß UC-6. Außerdem Bilder als DTOs.
 */
@Data
public class NoteDTO {

    /** Eindeutige ID der Notiz */
    private int id;

    /** Titel der Notiz */
    private String title;

    /** Inhalt/Beschreibung der Notiz */
    private String content;

    /** Tags der Notiz (z. B. ["Uni","Arbeit"]) */
    private List<String> tags = new ArrayList<>();

    /** (NEU) Kategorie der Notiz als String (Enum-Name, z. B. "STUDIUM", "ARBEIT", ...) */
    private String category;

    /** (NEU) Typ/Art der Notiz als String (Enum-Name, z. B. "TEXT", "TODO", "BILD", ...) */
    private String type;

    /** Erstellungszeitpunkt (für UC-5: Zeitraumfilter) */
    private Date createdAt;

    /** Bilder als DTO (mit aufgelösten URLs) */
    private List<ImageDTO> images = new ArrayList<>();

    /**
     * IDs von Bildern, die beim Update gelöscht werden sollen.
     * (Optional, nur beim Bearbeiten verwendet.)
     */
    private List<Integer> imagesToDelete;

    // ─────────────────────────────────────────────────────────────────────
    // Zusätzliche Setter/Getter-Utilities
    // ─────────────────────────────────────────────────────────────────────

    /** Robust-Setter für die Bildliste mit Validierung. */
    public void setImages(@NotNull List<ImageDTO> images) {
        this.images = Objects.requireNonNull(images, "Bilderliste darf nicht null sein");
        if (images.stream().anyMatch(Objects::isNull)) {
            throw new IllegalArgumentException("Bilderliste darf keine null-Elemente enthalten");
        }
    }

    /** Liefert immer eine nicht-null Liste für imagesToDelete. */
    public List<Integer> getImagesToDelete() {
        if (imagesToDelete == null) {
            imagesToDelete = new ArrayList<>();
        }
        return imagesToDelete;
    }

    /** Convenience: Einzelnen Tag setzen (überschreibt bestehende Liste). */
    public void setTag(String tag) {
        this.tags = new ArrayList<>();
        if (tag != null && !tag.isBlank()) {
            this.tags.add(tag);
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // Konvertierungsfunktionen
    // ─────────────────────────────────────────────────────────────────────

    /**
     * Konvertiert eine Note in ein NoteDTO.
     * WICHTIG: baseUrl wird hier übergeben (kein @Value auf static),
     * damit Bild-URLs korrekt als absolute Pfade gebaut werden:
     *   <baseUrl>/image/<filename>
     */
    public static NoteDTO convertToDto(Note note, String baseUrl) {
        NoteDTO dto = new NoteDTO();

        dto.setId(note.getId());
        dto.setTitle(note.getTitle());
        dto.setContent(note.getContent());

        // Tags (null-sicher)
        dto.setTags(note.getTags() != null ? new ArrayList<>(note.getTags()) : new ArrayList<>());

        // Kategorie/Typ aus Entity → String (Enum-Name)
        if (note.getCategory() != null) dto.setCategory(note.getCategory().name());
        if (note.getType() != null) dto.setType(note.getType().name());

        // Zeitstempel
        dto.setCreatedAt(note.getCreatedAt());

        // Bilder-URLs absolut machen (null-sicher)
        List<ImageDTO> imgs = new ArrayList<>();
        if (note.getImages() != null) {
            note.getImages().forEach(img ->
                    imgs.add(new ImageDTO(img.getId(), baseUrl + "/image/" + img.getUrl()))
            );
        }
        dto.setImages(imgs);

        return dto;
    }

    /** Batch-Konvertierung für Listen (mit gleicher baseUrl). */
    public static List<NoteDTO> convertListToDto(List<Note> notes, String baseUrl) {
        List<NoteDTO> out = new ArrayList<>();
        if (notes == null || notes.isEmpty()) return out;
        for (Note n : notes) {
            out.add(convertToDto(n, baseUrl));
        }
        return out;
    }
}
