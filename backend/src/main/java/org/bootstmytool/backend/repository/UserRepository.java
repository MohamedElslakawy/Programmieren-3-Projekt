package org.bootstmytool.backend.repository;

import org.bootstmytool.backend.model.User; // Importiert das User-Modell
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * @Author: Mohamed Elslakawy
 * @Version: 1.0
 * @Date: 2025-09-24
 *
 * Repository für die User-Entität.
 * Bietet CRUD-Operationen und eine benutzerdefinierte Abfrage für E-Mail.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    /**
     * Findet einen Benutzer anhand der E-Mail.
     * Spring Data JPA generiert die Implementierung automatisch.
     *
     * @param email Die E-Mail des gesuchten Benutzers
     * @return Optional<User> wenn ein Benutzer gefunden wurde
     */
    Optional<User> findByEmail(String email);
}
