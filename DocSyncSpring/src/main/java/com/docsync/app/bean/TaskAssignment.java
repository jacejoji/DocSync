package com.docsync.app.bean;

import java.time.LocalDate;
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
@Table(name = "task_assignments")
@Data
@EnableJpaAuditing
public class TaskAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @Column(name = "task_title", length = 200)
    private String taskTitle;

    @Column(name = "task_description", columnDefinition = "TEXT")
    private String taskDescription;

    @Column(name = "assigned_at")
    private LocalDateTime assignedAt;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(length = 50)
    private String status;
}