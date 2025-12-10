package com.docsync.app.dao;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.docsync.app.bean.InsuranceClaim;

@Repository
public interface InsuranceClaimRepository extends JpaRepository<InsuranceClaim, Long> {
	Optional<InsuranceClaim> findByClaimReferenceNumber(String claimReferenceNumber);

    // Find the claim associated with a specific appointment
    List<InsuranceClaim> findByAppointmentId(Long appointmentId);

    // Find history of claims for a specific patient policy
    List<InsuranceClaim> findByPatientInsurancePolicyId(Long patientInsurancePolicyId);

    // Find claims by status (e.g., PENDING, APPROVED, REJECTED)
    List<InsuranceClaim> findByStatus(String status);
}
