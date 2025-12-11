package com.docsync.app.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.docsync.app.bean.User;
import com.docsync.app.dao.DoctorRepository;
import com.docsync.app.dao.UserRepository;
import com.docsync.app.service.AuthService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.Data;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final AuthService authService;
	private final UserRepository userRepository;
	private final DoctorRepository doctorRepository;
    
    // Helper to save session manually (New requirement in Spring Boot 3)
    private final SecurityContextRepository securityContextRepository = 
            new HttpSessionSecurityContextRepository();

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            authService.registerUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body("User registered successfully");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest, 
                                   HttpServletRequest request, 
                                   HttpServletResponse response) {
        
        // 1. Authenticate
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
        );

        // 2. Set Security Context
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(authentication);
        SecurityContextHolder.setContext(context);
        securityContextRepository.saveContext(context, request, response);

        // 3. Find the User
        User user = userRepository.findByUsername(loginRequest.getUsername())
             .orElseThrow(() -> new RuntimeException("User not found"));

        // 4. Create a Map for the Response (No DTO needed)
        Map<String, String> responseBody = new HashMap<>();
        responseBody.put("username", user.getUsername());
        responseBody.put("role", user.getRole());

        // This returns JSON: { "username": "...", "role": "..." }
        return ResponseEntity.ok(responseBody);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate(); // Deletes the session on the server
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok("Logged out");
    }
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        // If session is invalid, 'authentication' will be null or Spring returns 403 before this runs
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Return the same JSON structure as Login
        Map<String, String> responseBody = new HashMap<>();
        responseBody.put("username", user.getUsername());
        responseBody.put("role", user.getRole());
        responseBody.put("id",String.valueOf(doctorRepository.findByEmail(user.getUsername()).get().getId()) );

        return ResponseEntity.ok(responseBody);
    }

    // Simple DTO class for login
    @Data
    public static class LoginRequest {
        private String username;
        private String password;
    }
}