package com.docsync.app.bean;

import java.time.LocalDate;

import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "medical_camps")
@Data
@EnableJpaAuditing
public class MedicalCamp {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "camp_name", length = 200)
    private String campName;

    @Column(length = 200)
    private String location;

    private LocalDate date;

    @Column(columnDefinition = "TEXT")
    private String description;
}