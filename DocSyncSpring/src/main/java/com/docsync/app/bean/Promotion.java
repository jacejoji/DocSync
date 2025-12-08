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
@Table(name = "promotions")
@Data
@EnableJpaAuditing
public class Promotion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @Column(name = "old_title", length = 150)
    private String oldTitle;

    @Column(name = "new_title", length = 150)
    private String newTitle;

    @Column(name = "promotion_date")
    private LocalDate promotionDate;
}
