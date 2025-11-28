package com.bayanihandrive.acebedobelenmedil.config;

import org.springframework.beans.factory.annotation.Value; // <-- IMPORT THIS
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder; // <-- IMPORT THIS
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder; // <-- IMPORT THIS
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import javax.crypto.spec.SecretKeySpec; // <-- IMPORT THIS
import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    // 1. Inject the secret from application.properties
    @Value("${supabase.jwt.secret}")
    private String supabaseJwtSecret;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authorize -> authorize
                // Allow public GET requests for campaigns
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/campaigns", "/api/campaigns/**").permitAll()
                
                // --- FIX: Allow public GET requests for donations ---
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/donations/campaign/**").permitAll()

                .requestMatchers(HttpMethod.GET, "/api/social/**").permitAll() 
                
                // All other API requests must be authenticated
                .requestMatchers("/api/**").authenticated() 
                .anyRequest().permitAll()
            )
            .oauth2ResourceServer(oauth2 -> 
                oauth2.jwt(jwt -> jwt.decoder(jwtDecoder()))
            );

        return http.build();
    }
    
    // 3. This Bean teaches Spring how to use HS256 with our secret
    @Bean
    public JwtDecoder jwtDecoder() {
        // We are telling it to use the HS256 algorithm
        SecretKeySpec secretKey = new SecretKeySpec(supabaseJwtSecret.getBytes(), "HMACSHA256");
        
        return NimbusJwtDecoder.withSecretKey(secretKey)
                .macAlgorithm(org.springframework.security.oauth2.jose.jws.MacAlgorithm.HS256)
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "x-supabase-auth"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}