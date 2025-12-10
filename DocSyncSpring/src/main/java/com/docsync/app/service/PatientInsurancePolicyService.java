package com.docsync.app.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.docsync.app.bean.PatientInsurancePolicy;
import com.docsync.app.dao.PatientInsurancePolicyRepository;

@Service
public class PatientInsurancePolicyService {

    @Autowired
    private PatientInsurancePolicyRepository policyRepository;

    @Transactional
    public PatientInsurancePolicy createPolicy(PatientInsurancePolicy policy) {
        // Business Logic: If this is marked as Primary, unset other primary policies for this patient
        if (Boolean.TRUE.equals(policy.getIsPrimary()) && policy.getPatient() != null) {
            unsetExistingPrimaryPolicy(policy.getPatient().getId());
        }
        return policyRepository.save(policy);
    }

    public List<PatientInsurancePolicy> getAllPolicies() {
        return policyRepository.findAll();
    }

    public Optional<PatientInsurancePolicy> getPolicyById(Long id) {
        return policyRepository.findById(id);
    }

    public List<PatientInsurancePolicy> getPoliciesByPatientId(Long patientId) {
        return policyRepository.findByPatientId(patientId);
    }
    
    public Optional<PatientInsurancePolicy> getPrimaryPolicyForPatient(Long patientId) {
        return policyRepository.findByPatientIdAndIsPrimaryTrue(patientId);
    }

    @Transactional
    public PatientInsurancePolicy updatePolicy(Long id, PatientInsurancePolicy details) {
        return policyRepository.findById(id).map(existingPolicy -> {
            // If updating to Primary, unset others
            if (Boolean.TRUE.equals(details.getIsPrimary()) && !Boolean.TRUE.equals(existingPolicy.getIsPrimary())) {
                unsetExistingPrimaryPolicy(existingPolicy.getPatient().getId());
            }

            existingPolicy.setPolicyNumber(details.getPolicyNumber());
            existingPolicy.setGroupNumber(details.getGroupNumber());
            existingPolicy.setPolicyHolderName(details.getPolicyHolderName());
            existingPolicy.setRelationshipToPatient(details.getRelationshipToPatient());
            existingPolicy.setPlanName(details.getPlanName());
            existingPolicy.setCoPayAmount(details.getCoPayAmount());
            existingPolicy.setCoInsurancePercent(details.getCoInsurancePercent());
            existingPolicy.setValidFrom(details.getValidFrom());
            existingPolicy.setValidUntil(details.getValidUntil());
            existingPolicy.setIsPrimary(details.getIsPrimary());
            // Note: We typically don't change the Patient or Provider reference on update
            
            return policyRepository.save(existingPolicy);
        }).orElse(null);
    }

    public boolean deletePolicy(Long id) {
        if (policyRepository.existsById(id)) {
            policyRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // Helper method to ensure only one Primary policy exists per patient
    private void unsetExistingPrimaryPolicy(Long patientId) {
        Optional<PatientInsurancePolicy> currentPrimary = policyRepository.findByPatientIdAndIsPrimaryTrue(patientId);
        currentPrimary.ifPresent(p -> {
            p.setIsPrimary(false);
            policyRepository.save(p);
        });
    }
}