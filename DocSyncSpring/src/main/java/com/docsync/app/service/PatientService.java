package com.docsync.app.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.docsync.app.bean.Patient;
import com.docsync.app.dao.PatientRepository;

@Service
public class PatientService {

    private final PatientRepository patientRepository;

    @Autowired
    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    // --- Create (Single) ---
    public Patient createPatient(Patient patient) {
        // Fallback if auditing is not enabled
        if (patient.getCreatedAt() == null) {
            patient.setCreatedAt(LocalDateTime.now());
        }
        return patientRepository.save(patient);
    }

    // --- Create (Bulk) ---
    @Transactional // Ensures all records are saved or rolled back together on error
    public List<Patient> createPatientsBulk(List<Patient> patients) {
        // Optional: Set CreatedAt manually for bulk items if auditing isn't set up
        patients.forEach(p -> {
            if (p.getCreatedAt() == null) p.setCreatedAt(LocalDateTime.now());
        });
        return patientRepository.saveAll(patients);
    }

    // --- Read ---
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }

    public Optional<Patient> getPatientById(Long id) {
        return patientRepository.findById(id);
    }

    // --- Update ---
    public Patient updatePatient(Long id, Patient patientDetails) {
        return patientRepository.findById(id).map(existingPatient -> {
            existingPatient.setFirstName(patientDetails.getFirstName());
            existingPatient.setLastName(patientDetails.getLastName());
            existingPatient.setEmail(patientDetails.getEmail());
            existingPatient.setPhone(patientDetails.getPhone());
            existingPatient.setDateOfBirth(patientDetails.getDateOfBirth());
            existingPatient.setGender(patientDetails.getGender());
            existingPatient.setAddress(patientDetails.getAddress());
            existingPatient.setBloodGroup(patientDetails.getBloodGroup());
            existingPatient.setEmergencyContactName(patientDetails.getEmergencyContactName());
            existingPatient.setEmergencyContactPhone(patientDetails.getEmergencyContactPhone());
            // We generally do not update 'createdAt'
            return patientRepository.save(existingPatient);
        }).orElseThrow(() -> new RuntimeException("Patient not found with id " + id));
    }

    // --- Delete ---
    public void deletePatient(Long id) {
        patientRepository.deleteById(id);
    }
}