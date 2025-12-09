package com.docsync.app.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.docsync.app.bean.AttendanceRecord;
import com.docsync.app.dao.AttendanceRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;

    /**
     * CLOCK IN: Creates a new record for today.
     * Throws exception if doctor has already checked in today.
     */
    public AttendanceRecord checkIn(AttendanceRecord record) {
        if (record.getDoctor() == null || record.getDoctor().getId() == null) {
            throw new IllegalArgumentException("Doctor ID is required for check-in.");
        }

        LocalDate today = LocalDate.now();

        // Check if record already exists for today
        Optional<AttendanceRecord> existingRecord = attendanceRepository
                .findByDoctorIdAndDate(record.getDoctor().getId(), today);

        if (existingRecord.isPresent()) {
            throw new IllegalStateException("Doctor has already checked in for today: " + today);
        }

        // Set defaults if not provided by client
        record.setDate(today);
        if (record.getCheckIn() == null) {
            record.setCheckIn(LocalTime.now());
        }
        if (record.getStatus() == null) {
            record.setStatus("PRESENT");
        }

        return attendanceRepository.save(record);
    }

    /**
     * CLOCK OUT: Updates the existing record for today with a check-out time.
     */
    public AttendanceRecord checkOut(Long doctorId) {
        LocalDate today = LocalDate.now();

        AttendanceRecord record = attendanceRepository.findByDoctorIdAndDate(doctorId, today)
                .orElseThrow(() -> new EntityNotFoundException("No check-in record found for today."));

        record.setCheckOut(LocalTime.now());
        // Optional: Logic to change status to 'COMPLETED' or similar
        
        return attendanceRepository.save(record);
    }

    public List<AttendanceRecord> getHistoryByDoctor(Long doctorId) {
        return attendanceRepository.findByDoctorId(doctorId);
    }

    public List<AttendanceRecord> getAllRecords() {
        return attendanceRepository.findAll();
    }
}