package com.docsync.app.dao;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.docsync.app.bean.LeaveRequest;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long> {
	List<LeaveRequest> findByDoctorId(Long doctorId);

    // Find requests by status (e.g., "PENDING", "APPROVED")
    // Useful for admin dashboards to see what needs approval
    List<LeaveRequest> findByStatus(String status);
    
    // Find specific requests for a doctor (e.g., show me my Approved leaves)
    List<LeaveRequest> findByDoctorIdAndStatus(Long doctorId, String status);
    }
