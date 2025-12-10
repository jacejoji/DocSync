package com.docsync.app.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.docsync.app.bean.SalaryRecord;
import com.docsync.app.service.SalaryRecordService;

@RestController
@RequestMapping("/api/salary-records")
public class SalaryRecordController {

    @Autowired
    private SalaryRecordService salaryRecordService;

    @PostMapping
    public ResponseEntity<SalaryRecord> createSalaryRecord(@RequestBody SalaryRecord salaryRecord) {
        SalaryRecord createdRecord = salaryRecordService.createSalaryRecord(salaryRecord);
        return new ResponseEntity<>(createdRecord, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<SalaryRecord>> getAllSalaryRecords() {
        List<SalaryRecord> records = salaryRecordService.getAllSalaryRecords();
        return new ResponseEntity<>(records, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SalaryRecord> getSalaryRecordById(@PathVariable Long id) {
        return salaryRecordService.getSalaryRecordById(id)
                .map(record -> new ResponseEntity<>(record, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Endpoint: Get full salary history for a specific doctor
    // Example: GET /api/salary-records/doctor/101
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<SalaryRecord>> getHistoryByDoctor(@PathVariable Long doctorId) {
        List<SalaryRecord> history = salaryRecordService.getSalaryHistoryByDoctor(doctorId);
        return new ResponseEntity<>(history, HttpStatus.OK);
    }

    // Endpoint: Get only the current active salary for a specific doctor
    // Example: GET /api/salary-records/doctor/101/current
    @GetMapping("/doctor/{doctorId}/current")
    public ResponseEntity<SalaryRecord> getCurrentSalary(@PathVariable Long doctorId) {
        return salaryRecordService.getCurrentSalaryForDoctor(doctorId)
                .map(record -> new ResponseEntity<>(record, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SalaryRecord> updateSalaryRecord(@PathVariable Long id, @RequestBody SalaryRecord salaryRecord) {
        SalaryRecord updatedRecord = salaryRecordService.updateSalaryRecord(id, salaryRecord);
        if (updatedRecord != null) {
            return new ResponseEntity<>(updatedRecord, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSalaryRecord(@PathVariable Long id) {
        if (salaryRecordService.deleteSalaryRecord(id)) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}