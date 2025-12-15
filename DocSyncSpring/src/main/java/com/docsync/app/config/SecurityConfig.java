package com.docsync.app.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityContextRepository securityContextRepository() {
        return new HttpSessionSecurityContextRepository();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, SecurityContextRepository securityContextRepository) throws Exception {
        http
            // 1. ENABLE CORS HERE
            .cors(Customizer.withDefaults())
            
            .csrf(AbstractHttpConfigurer::disable)
            .authorizeHttpRequests(auth -> auth
                // -- Swagger UI & API Docs --
                .requestMatchers(
                        "/v3/api-docs/**",
                        "/swagger-ui/**",
                        "/swagger-ui.html",
                        "/swagger-resources/**",
                        "/webjars/**"
                ).permitAll()
                .requestMatchers("/error").permitAll()
                
                // 2. Allow OPTIONS requests (Pre-flight checks) explicitly
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // -- Authentication --
                .requestMatchers("/auth/**").permitAll()
                // -- Department Restrictions --
                .requestMatchers(HttpMethod.POST, "/departments/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/departments/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/departments/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/departments/**").permitAll()
                .requestMatchers(HttpMethod.PATCH, "/equipment/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/equipment/**").permitAll()
				.requestMatchers(HttpMethod.POST, "/doctor-documents/**").hasRole("DOCTOR")
				.requestMatchers(HttpMethod.GET, "/doctor-documents/**").hasRole("DOCTOR")
				.requestMatchers(HttpMethod.DELETE, "/doctor-documents/**").hasRole("DOCTOR")
				.requestMatchers(HttpMethod.POST, "/insuranceprovider/**").hasRole("ADMIN")
				.requestMatchers(HttpMethod.GET, "/insuranceprovider/**").permitAll()
                // -- Fallback --
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(org.springframework.security.config.http.SessionCreationPolicy.IF_REQUIRED)
            )
            .securityContext(context -> context
                .securityContextRepository(securityContextRepository) 
            );

        return http.build();
    }

    // 3. DEFINE THE CORS CONFIGURATION BEAN
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // ALLOW YOUR FRONTEND URL (Adjust port if not 5173)
        configuration.setAllowedOrigins(List.of("http://16.112.128.57:5173","http://docsync.datavoid.in","https://docsync.datavoid.in")); 
        
        // Allow necessary HTTP methods
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        
        // Allow headers (Authorization, Content-Type, etc.)
        configuration.setAllowedHeaders(List.of("*"));
        
        // Allow cookies/credentials (Crucial for Session-based auth)
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
