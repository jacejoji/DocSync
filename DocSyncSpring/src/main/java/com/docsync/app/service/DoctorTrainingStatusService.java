package com.docsync.app.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.docsync.app.bean.DoctorTrainingStatus;
import com.docsync.app.dao.DoctorTrainingStatusRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DoctorTrainingStatusService {

    private final DoctorTrainingStatusRepository repository;

    @Transactional
    public DoctorTrainingStatus createStatus(DoctorTrainingStatus status) {
        // If completed is true but no date set, set it now
        if (Boolean.TRUE.equals(status.getCompleted()) && status.getCompletedAt() == null) {
            status.setCompletedAt(LocalDateTime.now());
        }
        return repository.save(status);
    }

    @Transactional
    public DoctorTrainingStatus updateStatus(Long id, DoctorTrainingStatus statusDetails) {
        return repository.findById(id).map(existingStatus -> {
            existingStatus.setDoctor(statusDetails.getDoctor());
            existingStatus.setTraining(statusDetails.getTraining());
            
            // Logic to handle completion timestamp automatically
            if (!Boolean.TRUE.equals(existingStatus.getCompleted()) && Boolean.TRUE.equals(statusDetails.getCompleted())) {
                 // If status changed to Complete, set timestamp
                 existingStatus.setCompletedAt(LocalDateTime.now());
            } else if (Boolean.FALSE.equals(statusDetails.getCompleted())) {
                // If status changed to Incomplete, clear timestamp
                existingStatus.setCompletedAt(null);
            }
            
            existingStatus.setCompleted(statusDetails.getCompleted());
            
            // Allow manual override of date if provided
            if (statusDetails.getCompletedAt() != null) {
                existingStatus.setCompletedAt(statusDetails.getCompletedAt());
            }

            return repository.save(existingStatus);
        }).orElseThrow(() -> new RuntimeException("Training status not found with id " + id));
    }
    
    // Helper method to specifically mark a training as done
    @Transactional
    public DoctorTrainingStatus markAsCompleted(Long id) {
        return repository.findById(id).map(status -> {
            status.setCompleted(true);
            status.setCompletedAt(LocalDateTime.now());
            return repository.save(status);
        }).orElseThrow(() -> new RuntimeException("Training status not found with id " + id));
    }

    public Optional<DoctorTrainingStatus> getStatusById(Long id) {
        return repository.findById(id);
    }

    public List<DoctorTrainingStatus> getAllStatuses() {
        return repository.findAll();
    }

    public List<DoctorTrainingStatus> getStatusesByDoctorId(Long doctorId) {
        return repository.findByDoctorId(doctorId);
    }

    @Transactional
    public void deleteStatus(Long id) {
        repository.deleteById(id);
    }
}