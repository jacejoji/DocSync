package com.docsync.app.service;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.docsync.app.bean.LeaveRequest;
import com.docsync.app.dao.LeaveRequestRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LeaveRequestService {

    private final LeaveRequestRepository repository;

    @Transactional
    public LeaveRequest createLeaveRequest(LeaveRequest request) {
        // 1. Set default status
        if (request.getStatus() == null) {
            request.setStatus("PENDING");
        }
        
        // 2. Basic Validation: Start date vs End date
        if (request.getLeaveFrom() != null && request.getLeaveTo() != null) {
            if (request.getLeaveTo().isBefore(request.getLeaveFrom())) {
                throw new IllegalArgumentException("Leave 'To' date cannot be before 'From' date");
            }
        }
        
        return repository.save(request);
    }

    @Transactional
    public LeaveRequest updateLeaveRequest(Long id, LeaveRequest requestDetails) {
        return repository.findById(id).map(existingRequest -> {
            existingRequest.setDoctor(requestDetails.getDoctor());
            existingRequest.setLeaveFrom(requestDetails.getLeaveFrom());
            existingRequest.setLeaveTo(requestDetails.getLeaveTo());
            existingRequest.setType(requestDetails.getType());
            existingRequest.setStatus(requestDetails.getStatus());
            return repository.save(existingRequest);
        }).orElseThrow(() -> new RuntimeException("Leave request not found with id " + id));
    }

    // Helper method to quickly approve a request
    @Transactional
    public LeaveRequest approveRequest(Long id) {
        return repository.findById(id).map(request -> {
            request.setStatus("APPROVED");
            return repository.save(request);
        }).orElseThrow(() -> new RuntimeException("Leave request not found with id " + id));
    }

    // Helper method to quickly reject a request
    @Transactional
    public LeaveRequest rejectRequest(Long id) {
        return repository.findById(id).map(request -> {
            request.setStatus("REJECTED");
            return repository.save(request);
        }).orElseThrow(() -> new RuntimeException("Leave request not found with id " + id));
    }

    public Optional<LeaveRequest> getLeaveRequestById(Long id) {
        return repository.findById(id);
    }

    public List<LeaveRequest> getAllLeaveRequests() {
        return repository.findAll();
    }

    public List<LeaveRequest> getLeaveRequestsByDoctor(Long doctorId) {
        return repository.findByDoctorId(doctorId);
    }

    public List<LeaveRequest> getLeaveRequestsByStatus(String status) {
        return repository.findByStatus(status);
    }

    @Transactional
    public void deleteLeaveRequest(Long id) {
        repository.deleteById(id);
    }
}