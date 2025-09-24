package org.bootstmytool.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;

/**
 * @Author Mohamed Elslakawy
 * @Version 1.0
 * @Date: 2025-09-24
 */
@SpringBootApplication
@EntityScan(basePackages = "org.bootstmytool.backend.model")
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }

}
