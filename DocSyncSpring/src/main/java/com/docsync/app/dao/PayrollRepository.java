package com.docsync.app.dao;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.docsync.app.bean.Payroll;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, Long> {
    Optional<Payroll> findByDoctorIdAndMonthAndYear(Long doctorId, String month, Integer year);
    List<Payroll> findByDoctorId(Long doctorId);
    List<Payroll> findByYear(Integer year);
    List<Payroll> findByMonthAndYear(String month, Integer year);
}
