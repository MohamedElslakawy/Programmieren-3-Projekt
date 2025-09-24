package org.bootstmytool.backend.security;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.firewall.DefaultHttpFirewall;
import org.springframework.security.web.firewall.HttpFirewall;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * @Author Mohamed Elslakawy
 * @Version 1.0
 * @Date: 2025-09-24
 *
 * Sicherheitskonfiguration:
 * - JWT-basierte Authentifizierung (stateless)
 * - CORS/CSRF Einstellungen
 * - Zugriffregeln pro Endpoint/HTTP-Methode
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserDetailsService userDetailsService;

    @Value("${jwt.secret}")
    private String jwtSecret;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          UserDetailsService userDetailsService) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.userDetailsService = userDetailsService;
    }

    @PostConstruct
    public void init() {
        // Hinweis: Falls kein Secret in der Config gesetzt ist, wird eins generiert.
        this.jwtSecret = JwtSecretGenerator.getSecretKey();
    }

    /** Passwort-Encoder (BCrypt) */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /** AuthenticationManager für Login/Authentifizierung */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration cfg) throws Exception {
        return cfg.getAuthenticationManager();
    }

    /**
     * Zentrale Sicherheitskette:
     * - CSRF aus (für stateless APIs mit JWT)
     * - CORS an
     * - Pfadregeln:
     *   * /api/auth/**: öffentlich (Login/Registrierung/Reset)
     *   * /share/** (GET): öffentlich (Weiterleitungsseite/Resolver ohne Auth-Header)
     *   * /api/share/**: geschützt (Erstellen/Verwalten von Share-Links)
     *   * /image/**:
     *       GET  -> permitAll (damit <img> ohne Authorization geladen werden kann)
     *       POST/PUT/DELETE -> authenticated (Upload/Änderung/Löschen nur mit Token)
     *   * sonst: authenticated
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // JWT → keine Server-Session
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // CSRF für APIs deaktivieren
                .csrf(csrf -> csrf.disable())
                // CORS aktivieren
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                // Autorisierungsregeln
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Auth-Endpoints (Login/Register/Verify/Reset) sind öffentlich
                        .requestMatchers("/api/auth/**").permitAll()

                        // Actuator (falls benötigt)
                        .requestMatchers("/actuator/**").permitAll()

                        // Share-Resolver per GET (z.B. /share/{token}) ist öffentlich
                        .requestMatchers(HttpMethod.GET, "/share/**").permitAll()
                        // Share-API (Erzeugen/Verwalten) erfordert Auth
                        .requestMatchers("/api/share/**").authenticated()

                        //  Bild-Endpunkte:
                        //  GET → öffentlich (img-Tags senden keinen Authorization-Header)
                        .requestMatchers(HttpMethod.GET, "/image/**").permitAll()
                        //    POST/PUT/DELETE → nur authentifiziert
                        .requestMatchers(HttpMethod.POST,   "/image/**").authenticated()
                        .requestMatchers(HttpMethod.PUT,    "/image/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/image/**").authenticated()

                        // alles andere: nur mit Auth
                        .anyRequest().authenticated()
                );

        // JWT-Filter vor UsernamePasswordAuthenticationFilter einhängen
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /** CORS-Konfiguration (erlaubte Origins/Methoden/Header) */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cors = new CorsConfiguration();
        cors.setAllowedOrigins(Arrays.asList(
                "http://localhost:3000",
                "http://localhost:3001",
                "http://localhost:3002",
                "http://localhost:3003",
                "http://192.168.178.144:3000",
                "http://192.168.178.144:3002"
        ));
        cors.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        cors.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With"));
        cors.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cors);
        return source;
    }

    /** (Optional) Firewall, die z.B. doppelte Slashes erlaubt */
    @Bean
    public HttpFirewall allowDoubleSlashFirewall() {
        return new DefaultHttpFirewall();
    }
}
