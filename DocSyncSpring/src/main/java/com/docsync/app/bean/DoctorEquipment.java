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
@Table(name = "doctor_equipment")
@Data
@EnableJpaAuditing
public class DoctorEquipment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;

    @ManyToOne
    @JoinColumn(name = "equipment_id")
    private Equipment equipment;

    @Column(name = "assigned_date")
    private LocalDate assignedDate;

    @Column(name = "returned_date")
    private LocalDate returnedDate;
}
