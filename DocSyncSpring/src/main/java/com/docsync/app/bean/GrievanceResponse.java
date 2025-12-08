package com.docsync.app.bean;

import java.time.LocalDateTime;

import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "grievance_responses")
@Data
@EnableJpaAuditing
public class GrievanceResponse {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "ticket_id")
    private GrievanceTicket ticket;

    @ManyToOne
    @JoinColumn(name = "responder_id")
    private User responder;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(name = "responded_at")
    private LocalDateTime respondedAt;
}
