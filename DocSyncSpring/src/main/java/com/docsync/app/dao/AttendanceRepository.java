package com.docsync.app.dao;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.docsync.app.bean.AttendanceRecord;

@Repository
public interface AttendanceRepository extends JpaRepository<AttendanceRecord,Long>{
	// Find all attendance records for a specific doctor
    List<AttendanceRecord> findByDoctorId(Long doctorId);

    // Find attendance for a specific doctor on a specific date (Crucial for logic)
    Optional<AttendanceRecord> findByDoctorIdAndDate(Long doctorId, LocalDate date);
}
