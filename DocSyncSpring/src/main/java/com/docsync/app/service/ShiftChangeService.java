package com.docsync.app.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.docsync.app.bean.ShiftChange;
import com.docsync.app.dao.ShiftChangeRepository;

@Service
public class ShiftChangeService {

    @Autowired
    private ShiftChangeRepository shiftChangeRepository;

    public ShiftChange createShiftChange(ShiftChange shiftChange) {
        // Default to today's date if not provided
        if (shiftChange.getChangeDate() == null) {
            shiftChange.setChangeDate(LocalDate.now());
        }
        return shiftChangeRepository.save(shiftChange);
    }

    public List<ShiftChange> getAllShiftChanges() {
        return shiftChangeRepository.findAll();
    }

    public Optional<ShiftChange> getShiftChangeById(Long id) {
        return shiftChangeRepository.findById(id);
    }

    public List<ShiftChange> getHistoryByDoctor(Long doctorId) {
        return shiftChangeRepository.findByDoctorIdOrderByChangeDateDesc(doctorId);
    }

    public ShiftChange updateShiftChange(Long id, ShiftChange details) {
        return shiftChangeRepository.findById(id).map(existingChange -> {
            existingChange.setOldShift(details.getOldShift());
            existingChange.setNewShift(details.getNewShift());
            existingChange.setChangeDate(details.getChangeDate());
            // Usually, we don't update the Doctor reference for a historical record
            return shiftChangeRepository.save(existingChange);
        }).orElse(null);
    }

    public boolean deleteShiftChange(Long id) {
        if (shiftChangeRepository.existsById(id)) {
            shiftChangeRepository.deleteById(id);
            return true;
        }
        return false;
    }
}