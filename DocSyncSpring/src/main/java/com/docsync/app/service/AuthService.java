package com.docsync.app.service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService; // Import this
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.docsync.app.bean.Doctor;
import com.docsync.app.bean.User;
import com.docsync.app.dao.DoctorRepository;
import com.docsync.app.dao.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
// 1. ADD 'implements UserDetailsService' here
public class AuthService implements UserDetailsService { 

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public User registerUser(User user) {
        // 1. Check if username exists
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }

        // 2. STRICT CHECK: Doctor details must be present
        if (user.getDoctor() == null) {
            throw new IllegalArgumentException("Doctor details are required. This is for Doctor registration only.");
        }

        // 3. Handle Password
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // 4. Handle Doctor Logic
        Doctor doctor = user.getDoctor();
        
        // Sync email and status
        doctor.setEmail(user.getUsername());
        doctor.setStatus("ACTIVE");

        // Validate Department
        if (doctor.getDepartment() == null || doctor.getDepartment().getId() == null) {
             throw new IllegalArgumentException("Doctor must belong to a valid department");
        }

        // Save Doctor first (to generate ID)
        Doctor savedDoctor = doctorRepository.save(doctor);
        
        // Link saved doctor back to user and FORCE role
        user.setDoctor(savedDoctor);
        user.setRole("DOCTOR"); 

        // 5. Save User
        return userRepository.save(user);
    }

    // 3. Logic to find a user (Required by Spring Security)
    @Override // Good practice to add this annotation
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .roles(user.getRole()) 
                .build();
    }
}