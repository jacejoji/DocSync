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
@Table(name = "leave_requests")
@Data
@EnableJpaAuditing
public class LeaveRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @Column(name = "leave_from")
    private LocalDate leaveFrom;

    @Column(name = "leave_to")
    private LocalDate leaveTo;

    @Column(length = 100)
    private String type;

    @Column(length = 50)
    private String status;
}
