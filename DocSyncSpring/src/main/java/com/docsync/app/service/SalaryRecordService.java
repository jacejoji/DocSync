package com.docsync.app.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.docsync.app.bean.SalaryRecord;
import com.docsync.app.dao.SalaryRecordRepository;

@Service
public class SalaryRecordService {

    @Autowired
    private SalaryRecordRepository salaryRecordRepository;

    public SalaryRecord createSalaryRecord(SalaryRecord salaryRecord) {
        // Default to today if no date is provided
        if (salaryRecord.getEffectiveFrom() == null) {
            salaryRecord.setEffectiveFrom(LocalDate.now());
        }
        return salaryRecordRepository.save(salaryRecord);
    }

    public List<SalaryRecord> getAllSalaryRecords() {
        return salaryRecordRepository.findAll();
    }

    public Optional<SalaryRecord> getSalaryRecordById(Long id) {
        return salaryRecordRepository.findById(id);
    }

    public List<SalaryRecord> getSalaryHistoryByDoctor(Long doctorId) {
        return salaryRecordRepository.findByDoctorIdOrderByEffectiveFromDesc(doctorId);
    }

    public Optional<SalaryRecord> getCurrentSalaryForDoctor(Long doctorId) {
        return salaryRecordRepository.findTopByDoctorIdOrderByEffectiveFromDesc(doctorId);
    }

    public SalaryRecord updateSalaryRecord(Long id, SalaryRecord details) {
        return salaryRecordRepository.findById(id).map(existingRecord -> {
            existingRecord.setBaseSalary(details.getBaseSalary());
            existingRecord.setHikePercent(details.getHikePercent());
            existingRecord.setEffectiveFrom(details.getEffectiveFrom());
            // Note: We usually don't change the Doctor reference on an existing salary record
            return salaryRecordRepository.save(existingRecord);
        }).orElse(null);
    }

    public boolean deleteSalaryRecord(Long id) {
        if (salaryRecordRepository.existsById(id)) {
            salaryRecordRepository.deleteById(id);
            return true;
        }
        return false;
    }
}