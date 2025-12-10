package com.docsync.app.service;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.docsync.app.bean.Doctor;
import com.docsync.app.bean.Payroll;
import com.docsync.app.dao.DoctorRepository;
import com.docsync.app.dao.PayrollRepository;

import jakarta.persistence.EntityExistsException;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
@Service
@RequiredArgsConstructor
public class PayrollService {

    private final PayrollRepository payrollRepository;
    private final DoctorRepository doctorRepository;

    // --- Create (Admin) ---
    @Transactional
    public Payroll createPayroll(Payroll payroll) {
        // Validate Doctor ID exists in the input
        if (payroll.getDoctor() == null || payroll.getDoctor().getId() == null) {
            throw new IllegalArgumentException("Doctor ID is required");
        }
        Long docId = payroll.getDoctor().getId();

        // 1. Check for duplicates
        Optional<Payroll> existing = payrollRepository.findByDoctorIdAndMonthAndYear(
                docId, payroll.getMonth(), payroll.getYear());
        
        if (existing.isPresent()) {
            throw new EntityExistsException("Payroll already exists for Doctor ID " + 
                docId + " in " + payroll.getMonth() + " " + payroll.getYear());
        }

        // 2. Fetch full Doctor entity from DB to ensure validity
        Doctor doctor = doctorRepository.findById(docId)
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found with ID: " + docId));
        payroll.setDoctor(doctor);

        // 3. Business Logic: Calculate Net Salary
        calculateNetSalary(payroll);

        // 4. Set Timestamp
        payroll.setProcessedAt(LocalDateTime.now());

        return payrollRepository.save(payroll);
    }

    // --- Read (Admin & Doctor) ---

    public Payroll getPayrollById(Long id) {
        return payrollRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Payroll not found with ID: " + id));
    }

    public List<Payroll> getAllPayrolls() {
        return payrollRepository.findAll();
    }

    public List<Payroll> getPayrollsByDoctorId(Long doctorId) {
        return payrollRepository.findByDoctorId(doctorId);
    }

    public List<Payroll> getPayrollsByYear(Integer year) {
        return payrollRepository.findByYear(year);
    }

    public List<Payroll> getPayrollsByMonthAndYear(String month, Integer year) {
        return payrollRepository.findByMonthAndYear(month, year);
    }

    // --- Update (Admin) ---

    @Transactional
    public Payroll updatePayroll(Long id, Payroll payrollDetails) {
        Payroll existingPayroll = getPayrollById(id);

        if (payrollDetails.getMonth() != null) existingPayroll.setMonth(payrollDetails.getMonth());
        if (payrollDetails.getYear() != null) existingPayroll.setYear(payrollDetails.getYear());
        
        // Update Doctor if provided
        if (payrollDetails.getDoctor() != null && payrollDetails.getDoctor().getId() != null) {
             Doctor doctor = doctorRepository.findById(payrollDetails.getDoctor().getId())
                .orElseThrow(() -> new EntityNotFoundException("Doctor not found"));
             existingPayroll.setDoctor(doctor);
        }

        // Update financial details and recalculate
        boolean recalc = false;
        if (payrollDetails.getGrossSalary() != null) {
            existingPayroll.setGrossSalary(payrollDetails.getGrossSalary());
            recalc = true;
        }
        if (payrollDetails.getDeductions() != null) {
            existingPayroll.setDeductions(payrollDetails.getDeductions());
            recalc = true;
        }

        if (recalc) {
            calculateNetSalary(existingPayroll);
        }

        return payrollRepository.save(existingPayroll);
    }

    public void deletePayroll(Long id) {
        if (!payrollRepository.existsById(id)) {
            throw new EntityNotFoundException("Payroll not found with ID: " + id);
        }
        payrollRepository.deleteById(id);
    }

    // Helper method to centralize math
    private void calculateNetSalary(Payroll payroll) {
        BigDecimal gross = payroll.getGrossSalary() != null ? payroll.getGrossSalary() : BigDecimal.ZERO;
        BigDecimal ded = payroll.getDeductions() != null ? payroll.getDeductions() : BigDecimal.ZERO;
        
        // Ensure deductions are set in case they were null in input
        payroll.setDeductions(ded); 
        payroll.setNetSalary(gross.subtract(ded));
    }
}