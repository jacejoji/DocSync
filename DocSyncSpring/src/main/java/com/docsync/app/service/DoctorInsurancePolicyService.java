package com.docsync.app.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.docsync.app.bean.DoctorInsurancePolicy;
import com.docsync.app.dao.DoctorInsurancePolicyRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DoctorInsurancePolicyService {

    private final DoctorInsurancePolicyRepository repository;

    @Transactional
    public DoctorInsurancePolicy createPolicy(DoctorInsurancePolicy policy) {
        // Uses the standard JpaRepository 'save' method
        return repository.save(policy);
    }

    @Transactional
    public DoctorInsurancePolicy updatePolicy(Long id, DoctorInsurancePolicy policyDetails) {
        return repository.findById(id).map(existingPolicy -> {
            existingPolicy.setDoctor(policyDetails.getDoctor());
            existingPolicy.setProvider(policyDetails.getProvider());
            existingPolicy.setPolicyNumber(policyDetails.getPolicyNumber());
            existingPolicy.setPolicyType(policyDetails.getPolicyType());
            existingPolicy.setCoverageAmount(policyDetails.getCoverageAmount());
            existingPolicy.setPremiumAmount(policyDetails.getPremiumAmount());
            existingPolicy.setValidFrom(policyDetails.getValidFrom());
            existingPolicy.setValidUntil(policyDetails.getValidUntil());
            existingPolicy.setPaidByHospital(policyDetails.getPaidByHospital());
            existingPolicy.setDocumentPath(policyDetails.getDocumentPath());
            existingPolicy.setStatus(policyDetails.getStatus());
            return repository.save(existingPolicy);
        }).orElseThrow(() -> new RuntimeException("Policy not found with id " + id));
    }

    public Optional<DoctorInsurancePolicy> getPolicyById(Long id) {
        return repository.findById(id);
    }

    public List<DoctorInsurancePolicy> getAllPolicies() {
        return repository.findAll();
    }

    public List<DoctorInsurancePolicy> getPoliciesByDoctorId(Long doctorId) {
        return repository.findByDoctorId(doctorId);
    }

    @Transactional
    public void deletePolicy(Long id) {
        repository.deleteById(id);
    }
}
