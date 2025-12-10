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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.docsync.app.bean.InsuranceClaim;
import com.docsync.app.service.InsuranceClaimService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/insurance-claims")
@RequiredArgsConstructor
public class InsuranceClaimController {

    private final InsuranceClaimService service;

    @PostMapping
    public ResponseEntity<InsuranceClaim> createClaim(@RequestBody InsuranceClaim claim) {
        InsuranceClaim createdClaim = service.createClaim(claim);
        return new ResponseEntity<>(createdClaim, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InsuranceClaim> updateClaim(@PathVariable Long id, @RequestBody InsuranceClaim claim) {
        try {
            return ResponseEntity.ok(service.updateClaim(id, claim));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<InsuranceClaim> getClaimById(@PathVariable Long id) {
        return service.getClaimById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    // Look up by Reference Number: /insurance-claims/reference/CLM-12345
    @GetMapping("/reference/{referenceNumber}")
    public ResponseEntity<InsuranceClaim> getClaimByReference(@PathVariable String referenceNumber) {
        return service.getClaimByReferenceNumber(referenceNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<InsuranceClaim>> getAllClaims() {
        return ResponseEntity.ok(service.getAllClaims());
    }

    // Get claim for a specific appointment
    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<List<InsuranceClaim>> getClaimsByAppointment(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(service.getClaimsByAppointment(appointmentId));
    }

    // Filter by status: /insurance-claims/status?val=PENDING
    @GetMapping("/status")
    public ResponseEntity<List<InsuranceClaim>> getClaimsByStatus(@RequestParam("val") String status) {
        return ResponseEntity.ok(service.getClaimsByStatus(status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClaim(@PathVariable Long id) {
        service.deleteClaim(id);
        return ResponseEntity.noContent().build();
    }
}