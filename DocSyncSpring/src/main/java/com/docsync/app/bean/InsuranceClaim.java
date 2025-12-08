package com.docsync.app.bean;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
@Table(name = "insurance_claims")
@Data
public class InsuranceClaim {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    @ManyToOne
    @JoinColumn(name = "patient_insurance_id", nullable = false)
    private PatientInsurancePolicy patientInsurancePolicy;

    @Column(name = "claim_reference_number", unique = true, length = 100)
    private String claimReferenceNumber;

    @Column(name = "submission_date")
    private LocalDateTime submissionDate;

    @Column(name = "processed_date")
    private LocalDateTime processedDate;

    @Column(name = "total_bill_amount", precision = 10, scale = 2)
    private BigDecimal totalBillAmount;

    @Column(name = "claimed_amount", precision = 10, scale = 2)
    private BigDecimal claimedAmount;

    @Column(name = "approved_amount", precision = 10, scale = 2)
    private BigDecimal approvedAmount;

    @Column(name = "patient_responsibility_amount", precision = 10, scale = 2)
    private BigDecimal patientResponsibilityAmount;

    @Column(length = 50)
    private String status;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;
}