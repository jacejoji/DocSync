package com.docsync.app.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.docsync.app.bean.DutyRoster;
import com.docsync.app.dao.DutyRosterRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DutyRosterService {

    private final DutyRosterRepository repository;

    @Transactional
    public DutyRoster createRoster(DutyRoster roster) {
        return repository.save(roster);
    }

    @Transactional
    public DutyRoster updateRoster(Long id, DutyRoster rosterDetails) {
        return repository.findById(id).map(existingRoster -> {
            existingRoster.setDoctor(rosterDetails.getDoctor());
            existingRoster.setDutyDate(rosterDetails.getDutyDate());
            existingRoster.setShift(rosterDetails.getShift());
            existingRoster.setDutyType(rosterDetails.getDutyType());
            return repository.save(existingRoster);
        }).orElseThrow(() -> new RuntimeException("Duty Roster not found with id " + id));
    }

    public Optional<DutyRoster> getRosterById(Long id) {
        return repository.findById(id);
    }

    public List<DutyRoster> getAllRosters() {
        return repository.findAll();
    }

    public List<DutyRoster> getRostersByDoctorId(Long doctorId) {
        return repository.findByDoctorId(doctorId);
    }
    
    public List<DutyRoster> getRostersByDate(LocalDate date) {
        return repository.findByDutyDate(date);
    }
    
    // Useful for fetching a monthly calendar view
    public List<DutyRoster> getRostersByDoctorAndDateRange(Long doctorId, LocalDate startDate, LocalDate endDate) {
        return repository.findByDoctorIdAndDutyDateBetween(doctorId, startDate, endDate);
    }

    @Transactional
    public void deleteRoster(Long id) {
        repository.deleteById(id);
    }
}