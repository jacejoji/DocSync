package com.docsync.app.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.docsync.app.bean.Schedule;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    List<Schedule> findByDoctorId(Long doctorId);
    
    // Find all doctors working on a specific day (e.g., "MONDAY")
    List<Schedule> findByDayOfWeek(String dayOfWeek);
}
