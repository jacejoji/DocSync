package com.docsync.app.dao;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.docsync.app.bean.DutyRoster;

@Repository
public interface DutyRosterRepository extends JpaRepository<DutyRoster,Long> {
	List<DutyRoster> findByDoctorId(Long doctorId);

    // Find rosters for a specific date (useful for daily schedule views)
    List<DutyRoster> findByDutyDate(LocalDate dutyDate);
    
    // Find rosters for a doctor within a date range (useful for monthly views)
    List<DutyRoster> findByDoctorIdAndDutyDateBetween(Long doctorId, LocalDate startDate, LocalDate endDate);

}
