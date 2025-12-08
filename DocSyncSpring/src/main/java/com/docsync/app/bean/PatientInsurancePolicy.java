package com.docsync.app.bean;

import java.math.BigDecimal;
import java.time.LocalDate;

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
@Table(name = "patient_insurance_policies")
@Data
public class PatientInsurancePolicy {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @ManyToOne
    @JoinColumn(name = "provider_id", nullable = false)
    private InsuranceProvider provider;

    @Column(name = "policy_number", nullable = false, length = 100)
    private String policyNumber;

    @Column(name = "group_number", length = 100)
    private String groupNumber;

    @Column(name = "policy_holder_name", length = 150)
    private String policyHolderName;

    @Column(name = "relationship_to_patient", length = 50)
    private String relationshipToPatient;

    @Column(name = "plan_name", length = 150)
    private String planName;

    @Column(name = "co_pay_amount", precision = 10, scale = 2)
    private BigDecimal coPayAmount;

    @Column(name = "co_insurance_percent", precision = 5, scale = 2)
    private BigDecimal coInsurancePercent;

    @Column(name = "valid_from")
    private LocalDate validFrom;

    @Column(name = "valid_until")
    private LocalDate validUntil;

    @Column(name = "is_primary")
    private Boolean isPrimary = true;
}