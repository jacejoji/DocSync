package com.docsync.app.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.docsync.app.bean.PatientInsurancePolicy;

@Repository
public interface PatientInsurancePolicyRepository extends JpaRepository<PatientInsurancePolicy, Long> {
    List<PatientInsurancePolicy> findByPatientId(Long patientId);
    
    // Find active policies
    List<PatientInsurancePolicy> findByPatientIdAndIsPrimaryTrue(Long patientId);
}