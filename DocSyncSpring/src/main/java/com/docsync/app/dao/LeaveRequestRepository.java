package com.docsync.app.dao;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.docsync.app.bean.LeaveRequest;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
    List<LeaveRequest> findByDoctorIdAndStatus(Long doctorId, String status);
    
    // Find overlapping leave requests
    List<LeaveRequest> findByDoctorIdAndLeaveFromBeforeAndLeaveToAfter(Long doctorId, LocalDate toDate, LocalDate fromDate);
}
