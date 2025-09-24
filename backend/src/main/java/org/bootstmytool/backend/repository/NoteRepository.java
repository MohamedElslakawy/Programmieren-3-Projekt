package org.bootstmytool.backend.repository;

import org.bootstmytool.backend.model.Image;
import org.bootstmytool.backend.model.Note;
import org.bootstmytool.backend.model.NoteCategory;
import org.bootstmytool.backend.model.NoteType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

/**
 * @Author: Mohamed Elslakawy
 * @Version: 1.0
 * @Date: 2025-09-24
 *
 * Repository für die Note-Entität. Stellt CRUD-Operationen bereit und
 * enthält Such-/Filtermethoden ( Kategorie, Typ, Zeitraum, Freitext).
 */
@Repository
public interface NoteRepository extends JpaRepository<Note, Integer> {

    // ──────────────────────────
    // Standard-Finder
    // ──────────────────────────

    /**
     * Findet eine Note anhand ihrer ID.
     */
    Optional<Note> findById(int noteId);

    /**
     * Alle Notizen eines bestimmten Benutzers.
     */
    List<Note> findByUserId(int userId);

    /**
     * Alias-Finder für einzelne Note via ID.
     */
    Optional<Note> getNoteById(int noteId);

    /**
     * Alle Notizen, die ein bestimmtes Bild enthalten.
     */
    List<Note> findByImagesContaining(Image image);

    // ──────────────────────────
    // Bequeme Filter-Finder (optional zu nutzen)
    // ──────────────────────────

    /**
     * Notizen eines Benutzers in Zeitintervall.
     */
    List<Note> findByUserIdAndCreatedAtBetween(int userId, Date from, Date to);

    /**
     * Notizen eines Benutzers gefiltert nach Kategorie.
     */
    List<Note> findByUserIdAndCategory(int userId, NoteCategory category);

    /**
     * Notizen eines Benutzers gefiltert nach Typ.
     */
    List<Note> findByUserIdAndType(int userId, NoteType type);

    /**
     * Notizen eines Benutzers gefiltert nach Kategorie, Typ und Zeitraum.
     */
    List<Note> findByUserIdAndCategoryAndTypeAndCreatedAtBetween(
            int userId, NoteCategory category, NoteType type, Date from, Date to
    );

    // ──────────────────────────
    // UC-5/UC-6: Flexible kombinierte Filter & Freitextsuche
    // ──────────────────────────

    /**
     * Kombinierte Filterabfrage
     */
    @Query("""
           SELECT n FROM Note n
           LEFT JOIN n.tags t
           WHERE n.user.id = :userId
             AND ( :q IS NULL
                   OR LOWER(n.title)   LIKE LOWER(CONCAT('%', :q, '%'))
                   OR LOWER(n.content) LIKE LOWER(CONCAT('%', :q, '%'))
                   OR (t IS NOT NULL AND LOWER(t) LIKE LOWER(CONCAT('%', :q, '%')))
                 )
             AND ( :category IS NULL OR n.category = :category )
             AND ( :type IS NULL     OR n.type = :type )
             AND ( :from IS NULL     OR n.createdAt >= :from )
             AND ( :to IS NULL       OR n.createdAt <= :to )
           GROUP BY n
           ORDER BY n.createdAt DESC
           """)
    List<Note> searchAndFilter(
            @Param("userId") int userId,
            @Param("q") String q,
            @Param("category") NoteCategory category,
            @Param("type") NoteType type,
            @Param("from") Date from,
            @Param("to") Date to
    );
}