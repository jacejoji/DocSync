package com.docsync.app.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.docsync.app.bean.MedicalCamp;
import com.docsync.app.dao.MedicalCampRepository;

@Service
public class MedicalCampService {

    @Autowired
    private MedicalCampRepository medicalCampRepository;

    public MedicalCamp createMedicalCamp(MedicalCamp medicalCamp) {
        return medicalCampRepository.save(medicalCamp);
    }

    public List<MedicalCamp> getAllMedicalCamps() {
        return medicalCampRepository.findAll();
    }

    public Optional<MedicalCamp> getMedicalCampById(Long id) {
        return medicalCampRepository.findById(id);
    }
    
    // Feature: Get camps happening today or in the future
    public List<MedicalCamp> getUpcomingCamps() {
        return medicalCampRepository.findByDateAfter(LocalDate.now().minusDays(1));
    }

    public MedicalCamp updateMedicalCamp(Long id, MedicalCamp campDetails) {
        return medicalCampRepository.findById(id).map(existingCamp -> {
            existingCamp.setCampName(campDetails.getCampName());
            existingCamp.setLocation(campDetails.getLocation());
            existingCamp.setDate(campDetails.getDate());
            existingCamp.setDescription(campDetails.getDescription());
            return medicalCampRepository.save(existingCamp);
        }).orElse(null);
    }

    public boolean deleteMedicalCamp(Long id) {
        if (medicalCampRepository.existsById(id)) {
            medicalCampRepository.deleteById(id);
            return true;
        }
        return false;
    }
}