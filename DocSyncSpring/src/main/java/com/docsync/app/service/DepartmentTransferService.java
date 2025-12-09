package com.docsync.app.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.docsync.app.bean.Department;
import com.docsync.app.bean.DepartmentTransfer;
import com.docsync.app.bean.Doctor;
import com.docsync.app.dao.DepartmentRepository;
import com.docsync.app.dao.DepartmentTransferRepository;
import com.docsync.app.dao.DoctorRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DepartmentTransferService {

    private final DepartmentTransferRepository transferRepository;
    private final DoctorRepository doctorRepository;
    private final DepartmentRepository departmentRepository;

    /**
     * Executes the transfer.
     * 1. Fetches the Doctor.
     * 2. Logs current dept as 'From'.
     * 3. Updates Doctor to 'To' dept.
     * 4. Saves both.
     */
    @Transactional // Critical: Both saves must succeed, or neither happens.
    public DepartmentTransfer transferDoctor(DepartmentTransfer transferRequest) {
        
        // 1. Validate Input
        if (transferRequest.getDoctor() == null || transferRequest.getToDepartment() == null) {
            throw new IllegalArgumentException("Doctor and Target Department are required.");
        }

        // 2. Fetch Entities
        Doctor doctor = doctorRepository.findById(transferRequest.getDoctor().getId())
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found"));

        Department targetDept = departmentRepository.findById(transferRequest.getToDepartment().getId())
                .orElseThrow(() -> new EntityNotFoundException("Target Department not found"));

        // 3. Auto-fill the "From Department" based on Doctor's CURRENT state
        transferRequest.setFromDepartment(doctor.getDepartment());

        // 4. Update the Transfer Record details
        transferRequest.setDoctor(doctor);
        transferRequest.setToDepartment(targetDept);
        if (transferRequest.getTransferDate() == null) {
            transferRequest.setTransferDate(LocalDate.now());
        }

        // 5. UPDATE THE DOCTOR (The requirement)
        doctor.setDepartment(targetDept);
        doctorRepository.save(doctor);

        // 6. Save the Transfer Log
        return transferRepository.save(transferRequest);
    }

    public List<DepartmentTransfer> getTransferHistory(Long doctorId) {
        return transferRepository.findByDoctorIdOrderByTransferDateDesc(doctorId);
    }
}