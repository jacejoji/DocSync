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

import com.docsync.app.bean.LeaveRequest;
import com.docsync.app.service.LeaveRequestService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/leave-requests")
@RequiredArgsConstructor
public class LeaveRequestController {
    private final LeaveRequestService service;

    @PostMapping
    public ResponseEntity<?> createLeaveRequest(@RequestBody LeaveRequest request) {
        try {
            LeaveRequest createdRequest = service.createLeaveRequest(request);
            return new ResponseEntity<>(createdRequest, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            // Return 400 Bad Request if dates are invalid
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<LeaveRequest> updateLeaveRequest(@PathVariable Long id, @RequestBody LeaveRequest request) {
        try {
            return ResponseEntity.ok(service.updateLeaveRequest(id, request));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Specific endpoint for Approving: PUT /api/leave-requests/{id}/approve
    @PutMapping("/{id}/approve")
    public ResponseEntity<LeaveRequest> approveRequest(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.approveRequest(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Specific endpoint for Rejecting: PUT /api/leave-requests/{id}/reject
    @PutMapping("/{id}/reject")
    public ResponseEntity<LeaveRequest> rejectRequest(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(service.rejectRequest(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    @GetMapping("/{id}")
    public ResponseEntity<LeaveRequest> getLeaveRequestById(@PathVariable Long id) {
        return service.getLeaveRequestById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<LeaveRequest>> getAllLeaveRequests() {
        return ResponseEntity.ok(service.getAllLeaveRequests());
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<LeaveRequest>> getRequestsByDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(service.getLeaveRequestsByDoctor(doctorId));
    }

    // Filter by status: /api/leave-requests/status?val=PENDING
    @GetMapping("/status")
    public ResponseEntity<List<LeaveRequest>> getRequestsByStatus(@RequestParam("val") String status) {
        return ResponseEntity.ok(service.getLeaveRequestsByStatus(status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLeaveRequest(@PathVariable Long id) {
        service.deleteLeaveRequest(id);
        return ResponseEntity.noContent().build();
    }
}