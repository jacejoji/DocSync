package com.docsync.app.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.docsync.app.bean.Payroll;
import com.docsync.app.service.PayrollService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payrolls")
@RequiredArgsConstructor
public class PayrollController {

    private final PayrollService payrollService;

    // Create
    @PostMapping
    public ResponseEntity<Payroll> createPayroll(@RequestBody Payroll payroll) {
        return new ResponseEntity<>(payrollService.createPayroll(payroll), HttpStatus.CREATED);
    }

    // Update
    @PutMapping("/{id}")
    public ResponseEntity<Payroll> updatePayroll(@PathVariable Long id, @RequestBody Payroll payroll) {
        return ResponseEntity.ok(payrollService.updatePayroll(id, payroll));
    }

    // Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayroll(@PathVariable Long id) {
        payrollService.deletePayroll(id);
        return ResponseEntity.noContent().build();
    }

    // Get All
    @GetMapping
    public ResponseEntity<List<Payroll>> getAllPayrolls() {
        return ResponseEntity.ok(payrollService.getAllPayrolls());
    }

    // Get Single
    @GetMapping("/{id}")
    public ResponseEntity<Payroll> getPayrollById(@PathVariable Long id) {
        return ResponseEntity.ok(payrollService.getPayrollById(id));
    }

    // --- Search Routes ---

    // Admin: Filter by Year
    @GetMapping("/search/year")
    public ResponseEntity<List<Payroll>> getPayrollsByYear(@RequestParam Integer year) {
        return ResponseEntity.ok(payrollService.getPayrollsByYear(year));
    }

    // Admin: Filter by Month & Year
    @GetMapping("/search/month-year")
    public ResponseEntity<List<Payroll>> getPayrollsByMonthAndYear(
            @RequestParam String month, 
            @RequestParam Integer year) {
        return ResponseEntity.ok(payrollService.getPayrollsByMonthAndYear(month, year));
    }

    // Doctor: Get my history
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Payroll>> getPayrollsByDoctorId(@PathVariable Long doctorId) {
        return ResponseEntity.ok(payrollService.getPayrollsByDoctorId(doctorId));
    }
}