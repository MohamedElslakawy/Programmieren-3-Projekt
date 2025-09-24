package org.bootstmytool.backend.controller;

import org.bootstmytool.backend.dto.NoteDTO;
import org.bootstmytool.backend.model.Image;
import org.bootstmytool.backend.model.Note;
import org.bootstmytool.backend.model.NoteCategory;
import org.bootstmytool.backend.model.NoteType;
import org.bootstmytool.backend.model.User;
import org.bootstmytool.backend.repository.NoteRepository;
import org.bootstmytool.backend.service.JwtService;
import org.bootstmytool.backend.service.NoteService;
import org.bootstmytool.backend.service.UserService;
import org.bootstmytool.backend.utils.ProcessImage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;
import java.util.stream.Collectors;

/**
 * @Author: Mohamed Elslakawy
 * @Version: 1.2
 * @Date: 2025-09-24
 *
 * NoteController verwaltet Endpunkte zum Erstellen, Abrufen, Bearbeiten und Filtern von Notizen.
 * UC-5: Filtern nach Suchbegriff (Titel/Content/Tags), Kategorie, Typ und Zeitraum.
 * Notizen können vordefinierten Kategorien/Typen zugeordnet und danach gefiltert werden.
 */
@RestController
@RequestMapping("/notes")
@CrossOrigin(origins = "http://localhost:3000") // Erlaubt Anfragen vom lokalen Frontend
public class NoteController {

    private final NoteService noteService;
    private final UserService userService;
    private final JwtService jwtService;
    private final NoteRepository noteRepository;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Autowired
    public NoteController(
            NoteService noteService,
            UserService userService,
            JwtService jwtService,
            NoteRepository noteRepository
    ) {
        this.noteService = noteService;
        this.userService = userService;
        this.jwtService = jwtService;
        this.noteRepository = noteRepository;
    }

    /**
     * Validiert den Authorization-Header (Bearer-Token) und liefert den zugehörigen Benutzer.
     */
    private User validateAuthorization(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new SecurityException("Invalid Authorization header.");
        }
        String token = authHeader.substring(7);
        String username = jwtService.extractUsername(token);
        if (username == null) {
            throw new SecurityException("Invalid token.");
        }
        User user = userService.getUserByUsername(username);
        if (user == null) {
            throw new SecurityException("Benutzer nicht gefunden.");
        }
        return user;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // UC-6: Notiz erstellen (inkl. optionaler Kategorie/Typ) + Bilder
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Endpunkt zum Erstellen einer neuen Notiz.
     * Erlaubt optionale Angabe von Kategorie und Typ, sowie Bilder-Upload (multipart/form-data).
     */
    @PostMapping(value = "/create", consumes = "multipart/form-data")
    public ResponseEntity<?> createNote(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam(value = "tags", required = false) String tags,
            @RequestParam(value = "category", required = false) NoteCategory category,
            @RequestParam(value = "type", required = false) String typeRaw, // 👈 String بدل Enum
            @RequestParam(value = "images", required = false) MultipartFile[] images
    ) {
        try {
            User user = validateAuthorization(authHeader);

            Note note = new Note();
            note.setTitle(title);
            note.setContent(description);

            // Tags (optional, kommagetrennt)
            if (tags != null && !tags.isBlank()) {
                List<String> tagList = Arrays.stream(tags.split(","))
                        .map(String::trim)
                        .filter(s -> !s.isBlank())
                        .collect(Collectors.toList());
                note.setTags(tagList);
            } else {
                note.setTags(new ArrayList<>());
            }

            // Kategorie (optional)
            if (category != null) note.setCategory(category);

            // Typ (optional) + Alias "BILD" → IMAGE
            if (typeRaw != null && !typeRaw.isBlank()) {
                String normalized = typeRaw.trim().toUpperCase();
                NoteType resolvedType;
                try {
                    resolvedType = NoteType.valueOf(normalized);
                } catch (IllegalArgumentException iae) {
                    if ("BILD".equalsIgnoreCase(normalized)) {
                        resolvedType = NoteType.IMAGE; // alias
                    } else {
                        return ResponseEntity
                                .status(HttpStatus.BAD_REQUEST)
                                .body("Ungültiger Typ: " + typeRaw + " (erwartet: TEXT, TODO, IMAGE, LINK, DOKUMENT)");
                    }
                }
                note.setType(resolvedType);
            }

            note.setUser(user);

            // Bilder (optional) → vorverarbeiten und an Notiz hängen
            List<Image> imageList = new ArrayList<>();
            if (images != null && images.length > 0) {
                imageList = Arrays.stream(images)
                        .filter(f -> f != null && !f.isEmpty())
                        .map(ProcessImage::processImage) // erzeugt Image inkl. gespeichertem Dateinamen
                        .collect(Collectors.toList());
            }
            note.setImages(imageList);

            // (Optional) Validierung: IMAGE ohne Bild ablehnen
            if (note.getType() == NoteType.IMAGE &&
                    (note.getImages() == null || note.getImages().isEmpty())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Für Typ IMAGE (BILD) muss mindestens ein Bild hochgeladen werden.");
            }

            // Speichern
            Note saved = noteService.createNote(note);

            // Als DTO (mit absoluten Bild-URLs) zurückgeben
            NoteDTO dto = NoteDTO.convertToDto(saved, baseUrl);
            return ResponseEntity.status(HttpStatus.CREATED).body(dto);

        } catch (IllegalArgumentException | SecurityException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to create note.");
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Notizen des eingeloggten Users laden (DTO)
    // ─────────────────────────────────────────────────────────────────────────

    @GetMapping("/get")
    public ResponseEntity<List<NoteDTO>> getNotesForUser(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Collections.emptyList());
        }
        String token = authHeader.substring(7);

        final String username;
        try {
            username = jwtService.extractUsername(token);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Collections.emptyList());
        }

        Optional<User> optionalUser = userService.findByUsername(username);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Collections.emptyList());
        }
        User user = optionalUser.get();

        try {
            List<Note> notes = noteService.getNotesByUserId((int) user.getId());
            if (notes.isEmpty()) {
                return ResponseEntity.noContent().build();
            }
            List<NoteDTO> dtos = NoteDTO.convertListToDto(notes, baseUrl);
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.emptyList());
        }
    }


    // Einzelne Notiz inkl. Bilder (DTO)

    @GetMapping("/get/{id}")
    public ResponseEntity<?> getNoteByIdWithImages(@PathVariable("id") int id) {
        Note note = noteService.getNoteById(id);
        if (note == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Nicht gefunden");
        }
        NoteDTO dto = NoteDTO.convertToDto(note, baseUrl);
        return ResponseEntity.ok(dto);
    }


    // Filtern nach q, Kategorie, Typ, Zeitraum (vom eingeloggten User)

    @GetMapping("/filter")
    public ResponseEntity<List<NoteDTO>> filterNotes(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) NoteCategory category,
            @RequestParam(required = false) NoteType type,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Date to
    ) {
        try {
            User user = validateAuthorization(authHeader);

            String query = (q != null && !q.isBlank()) ? q.trim() : null;

            Date toFixed = to;
            if (toFixed != null) {
                Calendar cal = Calendar.getInstance();
                cal.setTime(toFixed);
                cal.set(Calendar.HOUR_OF_DAY, 23);
                cal.set(Calendar.MINUTE, 59);
                cal.set(Calendar.SECOND, 59);
                cal.set(Calendar.MILLISECOND, 999);
                toFixed = cal.getTime();
            }

            List<Note> result = noteRepository.searchAndFilter(
                    (int) user.getId(),
                    query,
                    category,
                    type,
                    from,
                    toFixed
            );

            List<NoteDTO> dtos = NoteDTO.convertListToDto(result, baseUrl);
            return ResponseEntity.ok(dtos);

        } catch (SecurityException se) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Collections.emptyList());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Collections.emptyList());
        }
    }


    // Notiz ohne Bild ändern (inkl. optional Kategorie/Typ)
    @PutMapping(value = "/edit/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> editNoteWithoutImag(
            @PathVariable("id") int id,
            @RequestBody NoteDTO noteUpdates,
            @RequestHeader("Authorization") String authHeader
    ) {
        try {
            User user = validateAuthorization(authHeader);

            Note existingNote = noteService.getNoteById(id);
            if (existingNote == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Notiz nicht gefunden");
            }

            if (existingNote.getUser().getId() != user.getId()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Sie haben keine Berechtigung, diese Notiz zu bearbeiten");
            }

            if (noteUpdates.getTitle() != null)
                existingNote.setTitle(noteUpdates.getTitle());

            if (noteUpdates.getContent() != null)
                existingNote.setContent(noteUpdates.getContent());

            if (noteUpdates.getTags() != null)
                existingNote.setTags(noteUpdates.getTags());

            // Kategorie / Typ (Strings im DTO)
            if (noteUpdates.getCategory() != null) {
                try {
                    existingNote.setCategory(NoteCategory.valueOf(noteUpdates.getCategory()));
                } catch (IllegalArgumentException ex) {
                    return ResponseEntity.badRequest().body("Ungültige Kategorie: " + noteUpdates.getCategory());
                }
            }
            if (noteUpdates.getType() != null) {
                String t = noteUpdates.getType();
                try {
                    existingNote.setType(NoteType.valueOf(t));
                } catch (IllegalArgumentException ex) {
                    if ("BILD".equalsIgnoreCase(t)) {
                        existingNote.setType(NoteType.IMAGE); // alias beim Edit
                    } else {
                        return ResponseEntity.badRequest().body("Ungültiger Typ: " + t);
                    }
                }
            }

            Note updatedNote = noteService.updateNote(existingNote);
            NoteDTO responseDto = NoteDTO.convertToDto(updatedNote, baseUrl);
            return ResponseEntity.ok(responseDto);

        } catch (SecurityException se) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(se.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Fehler: " + e.getMessage());
        }
    }


    // Notiz löschen
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteNote(@PathVariable("id") int id) {
        try {
            String result = noteService.deleteNoteById(id);
            return ResponseEntity.ok().body(result);
        } catch (ResponseStatusException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getReason());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Oops!. 🛠️");
        }
    }
}
