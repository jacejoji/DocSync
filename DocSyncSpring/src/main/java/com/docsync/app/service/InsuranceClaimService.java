package com.docsync.app.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.docsync.app.bean.InsuranceClaim;
import com.docsync.app.dao.InsuranceClaimRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class InsuranceClaimService {

    private final InsuranceClaimRepository repository;

    @Transactional
    public InsuranceClaim createClaim(InsuranceClaim claim) {
        // Set default submission date if missing
        if (claim.getSubmissionDate() == null) {
            claim.setSubmissionDate(LocalDateTime.now());
        }
        // Default status
        if (claim.getStatus() == null) {
            claim.setStatus("SUBMITTED");
        }
        return repository.save(claim);
    }

    @Transactional
    public InsuranceClaim updateClaim(Long id, InsuranceClaim claimDetails) {
        return repository.findById(id).map(existingClaim -> {
            existingClaim.setAppointment(claimDetails.getAppointment());
            existingClaim.setPatientInsurancePolicy(claimDetails.getPatientInsurancePolicy());
            existingClaim.setClaimReferenceNumber(claimDetails.getClaimReferenceNumber());
            existingClaim.setTotalBillAmount(claimDetails.getTotalBillAmount());
            existingClaim.setClaimedAmount(claimDetails.getClaimedAmount());
            
            // Business Logic: If status is changing to APPROVED/REJECTED, set processed date
            if (!"PROCESSED".equals(existingClaim.getStatus()) && 
                ("APPROVED".equalsIgnoreCase(claimDetails.getStatus()) || "REJECTED".equalsIgnoreCase(claimDetails.getStatus()))) {
                existingClaim.setProcessedDate(LocalDateTime.now());
            }

            existingClaim.setApprovedAmount(claimDetails.getApprovedAmount());
            existingClaim.setRejectionReason(claimDetails.getRejectionReason());
            existingClaim.setStatus(claimDetails.getStatus());

            // Auto-calculate Patient Responsibility: (Total Bill - Approved Amount)
            if (claimDetails.getTotalBillAmount() != null && claimDetails.getApprovedAmount() != null) {
                BigDecimal responsibility = claimDetails.getTotalBillAmount().subtract(claimDetails.getApprovedAmount());
                // Ensure we don't return negative values if approved > bill (rare edge case)
                existingClaim.setPatientResponsibilityAmount(responsibility.max(BigDecimal.ZERO));
            } else {
                existingClaim.setPatientResponsibilityAmount(claimDetails.getPatientResponsibilityAmount());
            }

            return repository.save(existingClaim);
        }).orElseThrow(() -> new RuntimeException("Claim not found with id " + id));
    }

    public Optional<InsuranceClaim> getClaimById(Long id) {
        return repository.findById(id);
    }

    public Optional<InsuranceClaim> getClaimByReferenceNumber(String referenceNumber) {
        return repository.findByClaimReferenceNumber(referenceNumber);
    }

    public List<InsuranceClaim> getAllClaims() {
        return repository.findAll();
    }

    public List<InsuranceClaim> getClaimsByAppointment(Long appointmentId) {
        return repository.findByAppointmentId(appointmentId);
    }
    
    public List<InsuranceClaim> getClaimsByStatus(String status) {
        return repository.findByStatus(status);
    }

    @Transactional
    public void deleteClaim(Long id) {
        repository.deleteById(id);
    }
}
