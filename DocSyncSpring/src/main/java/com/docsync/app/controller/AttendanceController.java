package com.docsync.app.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.docsync.app.bean.AttendanceRecord;
import com.docsync.app.service.AttendanceService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    // POST: Doctor Check-in
    @PostMapping("/check-in")
    public ResponseEntity<?> checkIn(@RequestBody AttendanceRecord record) {
        try {
            AttendanceRecord newRecord = attendanceService.checkIn(record);
            return new ResponseEntity<>(newRecord, HttpStatus.CREATED);
        } catch (IllegalStateException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT); // 409 Conflict
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // PUT: Doctor Check-out (using Doctor ID)
    @PutMapping("/check-out/{doctorId}")
    public ResponseEntity<?> checkOut(@PathVariable Long doctorId) {
        try {
            AttendanceRecord updatedRecord = attendanceService.checkOut(doctorId);
            return ResponseEntity.ok(updatedRecord);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    // GET: History for a specific doctor
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<AttendanceRecord>> getDoctorHistory(@PathVariable Long doctorId) {
        return ResponseEntity.ok(attendanceService.getHistoryByDoctor(doctorId));
    }

    // GET: Admin view (all records)
    @GetMapping
    public ResponseEntity<List<AttendanceRecord>> getAllRecords() {
        return ResponseEntity.ok(attendanceService.getAllRecords());
    }
}