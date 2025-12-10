package com.docsync.app.controller;

import java.util.List;

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

import com.docsync.app.bean.DoctorInsurancePolicy;
import com.docsync.app.service.DoctorInsurancePolicyService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/doctor-insurance-policies")
@RequiredArgsConstructor
public class DoctorInsurancePolicyController {

    private final DoctorInsurancePolicyService service;

    @PostMapping
    public ResponseEntity<DoctorInsurancePolicy> createPolicy(@RequestBody DoctorInsurancePolicy policy) {
        DoctorInsurancePolicy createdPolicy = service.createPolicy(policy);
        return new ResponseEntity<>(createdPolicy, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DoctorInsurancePolicy> updatePolicy(@PathVariable Long id, @RequestBody DoctorInsurancePolicy policy) {
        try {
            return ResponseEntity.ok(service.updatePolicy(id, policy));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoctorInsurancePolicy> getPolicyById(@PathVariable Long id) {
        return service.getPolicyById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<DoctorInsurancePolicy>> getAllPolicies() {
        return ResponseEntity.ok(service.getAllPolicies());
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<DoctorInsurancePolicy>> getPoliciesByDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(service.getPoliciesByDoctorId(doctorId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePolicy(@PathVariable Long id) {
        service.deletePolicy(id);
        return ResponseEntity.noContent().build();
    }
}