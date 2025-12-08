package com.docsync.app.bean;

import java.time.LocalDate;

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
@Table(name = "performance_reviews")
@Data
@EnableJpaAuditing
public class PerformanceReview {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @ManyToOne
    @JoinColumn(name = "reviewer_id")
    private User reviewer; // Links to Auth User

    @Column(columnDefinition = "TEXT")
    private String comments;

    private Integer rating;

    @Column(name = "review_date")
    private LocalDate reviewDate;
}
