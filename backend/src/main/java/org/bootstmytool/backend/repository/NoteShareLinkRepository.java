package org.bootstmytool.backend.repository;
//NoteShareLinkRepository Moh
import java.util.Optional;
import org.bootstmytool.backend.model.NoteShareLink;
import org.bootstmytool.backend.model.NoteShareLink;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * @Author: Mohamed Elslakawy
 * @Version: 1.0
 * @Date: 2025-09-24
 */
public interface NoteShareLinkRepository extends JpaRepository<NoteShareLink, Long> {
    Optional<NoteShareLink> findByTokenAndActiveTrue(String token);
}
