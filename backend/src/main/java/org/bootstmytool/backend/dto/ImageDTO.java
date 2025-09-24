package org.bootstmytool.backend.dto;

import lombok.Getter;
import lombok.Setter;

/**
 * @Author: Mohamed Elslakawy
 * @Version: 1.0
 * @Date: 2025-09-24
 *
 * Das ImageDTO (Data Transfer Object) wird verwendet, um Bilddaten zwischen den verschiedenen Schichten der Anwendung zu übertragen.
 * Es enthält grundlegende Informationen über das Bild wie die URL.
 */
@Setter
@Getter
public class ImageDTO {
    /**
     * Gibt die URL des Bildes zurueck.
     *
     * Setzt die URL des Bildes.
     */
    private String url;
    private int id;

    /**
     * Erstellt ein neues ImageDTO.
     */
    public ImageDTO() {
    }

    /**
     * Erstellt ein neues ImageDTO.
     *
     * @param url Die URL des Bildes.
     */
    public ImageDTO(String url) {
        this.url = url;
    }

    public ImageDTO(int id, String url) {
        this.id = id;
        this.url = url;
    }

}