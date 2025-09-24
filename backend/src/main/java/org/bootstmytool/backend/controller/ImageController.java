package org.bootstmytool.backend.controller;

import org.bootstmytool.backend.dto.ImageDTO;
import org.bootstmytool.backend.model.Image;
import org.bootstmytool.backend.model.Note;
import org.bootstmytool.backend.service.ImageService;
import org.bootstmytool.backend.repository.NoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * @Author: Mohamed Elslakawy
 * @Version: 1.0
 * @Date: 2025-09-24
 *
 * REST-Controller für Bild-Endpunkte.
 * - Bilder einer Notiz abfragen
 * - Bilddatei ausliefern
 * - Bilder zu einer Notiz hochladen/löschen
 */
@RestController
@RequestMapping("/image")
public class ImageController {

    private final ImageService imageService;
    private final NoteRepository noteRepository;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Autowired
    public ImageController(ImageService imageService, NoteRepository noteRepository) {
        this.imageService = imageService;
        this.noteRepository = noteRepository;
    }

    /**
     * Liefert alle Bilder zu einer Note.
     * Rückgabe ist 200 mit leerer Liste, wenn keine Bilder vorhanden sind
     * (tact 404), damit das Frontend nicht in einen Fehler läuft.
     */
    @GetMapping("/note/{noteId}")
    public ResponseEntity<List<ImageDTO>> getImagesByNoteId(@PathVariable int noteId) {
        List<Image> images = imageService.getImagesByNoteId(noteId);
        List<ImageDTO> imageDTOs = new ArrayList<>();
        if (images != null) {
            for (Image image : images) {
                // image.getUrl() sollte nur der Dateiname sein
                imageDTOs.add(new ImageDTO(image.getId(), baseUrl + "/image/" + image.getUrl()));
            }
        }
        return ResponseEntity.ok(imageDTOs); // 200 OK, auch wenn Liste leer ist
    }

    /**
     * Liefert die Binärdatei eines Bildes.
     * (Einfacher Fileserver über UrlResource; in Prod lieber über Static-Resources.)
     */
    @GetMapping("/{imageName}")
    public ResponseEntity<?> getImage(@PathVariable String imageName) {
        try {
            // ⚠️ Pfad funktioniert im Dev-Mode; für JAR-Deploy lieber classpath:/static/images/
            Path path = Paths.get("backend/src/main/resources/static/images/" + imageName);
            Resource resource = new UrlResource(path.toUri());
            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok().body(resource);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error loading image: " + e.getMessage());
        }
    }

    /**
     * Bild löschen per ID.
     */
    @DeleteMapping("/delete/{imageId}")
    public ResponseEntity<?> deleteImageById(@PathVariable int imageId) {
        String imageUrl = imageService.getImageUrl(imageId);
        if (imageUrl == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Bild nicht gefunden"));
        }
        try {
            imageService.deleteImageById(imageId);
            return ResponseEntity.ok(Map.of("message", "Image deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while deleting image: " + e.getMessage());
        }
    }

    /**
     * Bilder-Upload für eine Note.
     * Unterstützt sowohl mehrere Dateien unter "images"
     * als auch eine einzelne Datei unter "image" (Abwärtskompatibilität).
     * Erwartet: Multipart-Form-Data
     */
    @PostMapping(value = "/{noteId}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> addImagesToNote(
            @PathVariable("noteId") int noteId,
            @RequestParam(value = "images", required = false) List<MultipartFile> images, // mehrere Dateien
            @RequestParam(value = "image", required = false) MultipartFile image // einzelne Datei (alt)
    ) {
        // Note existiert?
        Note note = noteRepository.findById(noteId)
                .orElse(null);
        if (note == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Note not found: " + noteId);
        }

        // Eingaben normalisieren → immer Liste verwenden
        List<MultipartFile> files = new ArrayList<>();
        if (images != null && !images.isEmpty()) {
            files.addAll(images);
        }
        if (image != null && !image.isEmpty()) {
            files.add(image);
        }
        if (files.isEmpty()) {
            return ResponseEntity.badRequest().body("No files provided");
        }

        try {
            // Service speichert Datei(en) (z.B. auf Platte) + DB-Eintrag mit Verknüpfung zur Note
            List<Image> saved = new ArrayList<>();
            for (MultipartFile f : files) {
                Image img = imageService.uploadImage(noteId, f); // vorhandene Service-Methode für Single-Upload
                saved.add(img);
            }
            // Antwort als DTO-Liste
            List<ImageDTO> dtos = saved.stream()
                    .map(img -> new ImageDTO(img.getId(), baseUrl + "/image/" + img.getUrl()))
                    .toList();
            return ResponseEntity.status(HttpStatus.CREATED).body(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error while uploading images: " + e.getMessage());
        }
    }
}
