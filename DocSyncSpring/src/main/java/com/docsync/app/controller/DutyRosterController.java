package com.docsync.app.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
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

import com.docsync.app.bean.DutyRoster;
import com.docsync.app.service.DutyRosterService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/duty-rosters")
@RequiredArgsConstructor
public class DutyRosterController {

    private final DutyRosterService service;

    @PostMapping
    public ResponseEntity<DutyRoster> createRoster(@RequestBody DutyRoster roster) {
        DutyRoster createdRoster = service.createRoster(roster);
        return new ResponseEntity<>(createdRoster, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DutyRoster> updateRoster(@PathVariable Long id, @RequestBody DutyRoster roster) {
        try {
            return ResponseEntity.ok(service.updateRoster(id, roster));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<DutyRoster> getRosterById(@PathVariable Long id) {
        return service.getRosterById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<DutyRoster>> getAllRosters() {
        return ResponseEntity.ok(service.getAllRosters());
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<DutyRoster>> getRostersByDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(service.getRostersByDoctorId(doctorId));
    }

    // Endpoint for daily schedule: /api/duty-rosters/date?date=2023-10-27
    @GetMapping("/date")
    public ResponseEntity<List<DutyRoster>> getRostersByDate(
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(service.getRostersByDate(date));
    }
    
    // Endpoint for range: /api/duty-rosters/schedule?doctorId=1&start=2023-10-01&end=2023-10-31
    @GetMapping("/schedule")
    public ResponseEntity<List<DutyRoster>> getRostersByRange(
            @RequestParam("doctorId") Long doctorId,
            @RequestParam("start") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("end") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(service.getRostersByDoctorAndDateRange(doctorId, startDate, endDate));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoster(@PathVariable Long id) {
        service.deleteRoster(id);
        return ResponseEntity.noContent().build();
    }
}
