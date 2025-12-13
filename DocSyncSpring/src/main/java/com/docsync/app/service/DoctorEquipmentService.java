package com.docsync.app.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.docsync.app.bean.Doctor;
import com.docsync.app.bean.DoctorEquipment;
import com.docsync.app.bean.Equipment;
import com.docsync.app.dao.DoctorEquipmentRepository;
import com.docsync.app.dao.DoctorRepository;
@Service
public class DoctorEquipmentService {

    @Autowired
    private DoctorEquipmentRepository repo;
    
    @Autowired
    private DoctorRepository doctorRepo;
    
    @Autowired
    private EquipmentService equipmentService; // Using service to reuse logic or repo

    public DoctorEquipment assignEquipment(DoctorEquipment assignment) {
        // 1. Validate inputs exist
        Long equipId = assignment.getEquipment().getId();
        Long docId = assignment.getDoctor().getId();

        Equipment equipment = equipmentService.getEquipmentById(equipId)
            .orElseThrow(() -> new RuntimeException("Equipment not found with ID: " + equipId));
            
        Doctor doctor = doctorRepo.findById(docId)
            .orElseThrow(() -> new RuntimeException("Doctor not found with ID: " + docId));

        // 2. Validate Equipment Logic (Check if already assigned)
        boolean isAlreadyAssigned = repo.existsByEquipmentIdAndReturnedDateIsNull(equipId);
        if (isAlreadyAssigned) {
            throw new RuntimeException("Equipment is currently assigned and has not been returned.");
        }

        // 3. Set the REAL managed entities into the assignment
        // This prevents the 500 error caused by partial/detached objects
        assignment.setEquipment(equipment);
        assignment.setDoctor(doctor);

        // 4. Save
        return repo.save(assignment);
    }

    public DoctorEquipment updateAssignment(Long id, DoctorEquipment details) {
        return repo.findById(id).map(existing -> {
            // Update fields if provided
            if (details.getReturnedDate() != null) {
                existing.setReturnedDate(details.getReturnedDate());
            }
            if (details.getAssignedDate() != null) {
                existing.setAssignedDate(details.getAssignedDate());
            }
            return repo.save(existing);
        }).orElseThrow(() -> new RuntimeException("Assignment ID not found"));
    }

    public void deleteAssignment(Long id) {
        if (repo.existsById(id)) {
            repo.deleteById(id);
        } else {
            throw new RuntimeException("Assignment ID not found");
        }
    }
}