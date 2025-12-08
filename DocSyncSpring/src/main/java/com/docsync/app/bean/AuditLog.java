package com.docsync.app.bean;

import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "audit_logs")
@Data
@EnableJpaAuditing
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(length = 200)
    private String action;

    @Column(columnDefinition = "TEXT")
    private String details;

    private LocalDateTime timestamp;
}

