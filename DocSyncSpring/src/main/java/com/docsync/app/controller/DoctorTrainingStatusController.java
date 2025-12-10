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

import com.docsync.app.bean.DoctorTrainingStatus;
import com.docsync.app.service.DoctorTrainingStatusService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/doctor-training-status")
@RequiredArgsConstructor
public class DoctorTrainingStatusController {

    private final DoctorTrainingStatusService service;

    @PostMapping
    public ResponseEntity<DoctorTrainingStatus> createStatus(@RequestBody DoctorTrainingStatus status) {
        DoctorTrainingStatus createdStatus = service.createStatus(status);
        return new ResponseEntity<>(createdStatus, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DoctorTrainingStatus> updateStatus(@PathVariable Long id, @RequestBody DoctorTrainingStatus status) {
        try {
            return ResponseEntity.ok(service.updateStatus(id, status));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    // Specialized endpoint to mark training as complete
    @PutMapping("/{id}/complete")
    public ResponseEntity<DoctorTrainingStatus> markAsComplete(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.markAsCompleted(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<DoctorTrainingStatus> getStatusById(@PathVariable Long id) {
        return service.getStatusById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<DoctorTrainingStatus>> getAllStatuses() {
        return ResponseEntity.ok(service.getAllStatuses());
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<DoctorTrainingStatus>> getStatusesByDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(service.getStatusesByDoctorId(doctorId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStatus(@PathVariable Long id) {
        service.deleteStatus(id);
        return ResponseEntity.noContent().build();
    }
}