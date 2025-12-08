package com.docsync.app.dao;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.docsync.app.bean.Doctor;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByEmail(String email);
    
    List<Doctor> findByDepartmentId(Long departmentId);
    
    List<Doctor> findByStatus(String status);
    
    // Custom query to search doctors by name or specialization
    @Query("SELECT d FROM Doctor d WHERE " +
           "(LOWER(d.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(d.lastName) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "LOWER(d.specialization) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Doctor> searchDoctors(@Param("keyword") String keyword);
}
