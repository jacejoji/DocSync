package com.docsync.app.dao;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.docsync.app.bean.PatientInsurancePolicy;

@Repository
public interface PatientInsurancePolicyRepository extends JpaRepository<PatientInsurancePolicy, Long> {
List<PatientInsurancePolicy> findByPatientId(Long patientId);
    
    // Find only the primary policy for a patient (useful for billing)
    Optional<PatientInsurancePolicy> findByPatientIdAndIsPrimaryTrue(Long patientId);

    // Find a policy by its unique number (to prevent duplicates or for search)
    Optional<PatientInsurancePolicy> findByPolicyNumber(String policyNumber);
}