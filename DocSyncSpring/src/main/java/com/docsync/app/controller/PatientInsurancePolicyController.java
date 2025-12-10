package com.docsync.app.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.docsync.app.bean.PatientInsurancePolicy;
import com.docsync.app.service.PatientInsurancePolicyService;

@RestController
@RequestMapping("/api/patient-insurance")
public class PatientInsurancePolicyController {

    @Autowired
    private PatientInsurancePolicyService policyService;

    @PostMapping
    public ResponseEntity<PatientInsurancePolicy> createPolicy(@RequestBody PatientInsurancePolicy policy) {
        PatientInsurancePolicy created = policyService.createPolicy(policy);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<PatientInsurancePolicy>> getAllPolicies() {
        return new ResponseEntity<>(policyService.getAllPolicies(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientInsurancePolicy> getPolicyById(@PathVariable Long id) {
        return policyService.getPolicyById(id)
                .map(policy -> new ResponseEntity<>(policy, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Get all policies for a specific patient
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<PatientInsurancePolicy>> getPoliciesByPatient(@PathVariable Long patientId) {
        List<PatientInsurancePolicy> policies = policyService.getPoliciesByPatientId(patientId);
        return new ResponseEntity<>(policies, HttpStatus.OK);
    }
    
    // Get specifically the Primary policy for a patient
    @GetMapping("/patient/{patientId}/primary")
    public ResponseEntity<PatientInsurancePolicy> getPrimaryPolicy(@PathVariable Long patientId) {
        return policyService.getPrimaryPolicyForPatient(patientId)
                .map(policy -> new ResponseEntity<>(policy, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PatientInsurancePolicy> updatePolicy(@PathVariable Long id, @RequestBody PatientInsurancePolicy policy) {
        PatientInsurancePolicy updated = policyService.updatePolicy(id, policy);
        if (updated != null) {
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePolicy(@PathVariable Long id) {
        if (policyService.deletePolicy(id)) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}