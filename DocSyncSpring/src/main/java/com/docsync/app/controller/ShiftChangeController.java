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

import com.docsync.app.bean.ShiftChange;
import com.docsync.app.service.ShiftChangeService;

@RestController
@RequestMapping("/api/shift-changes")
public class ShiftChangeController {

    @Autowired
    private ShiftChangeService shiftChangeService;

    @PostMapping
    public ResponseEntity<ShiftChange> createShiftChange(@RequestBody ShiftChange shiftChange) {
        ShiftChange created = shiftChangeService.createShiftChange(shiftChange);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<ShiftChange>> getAllShiftChanges() {
        List<ShiftChange> changes = shiftChangeService.getAllShiftChanges();
        return new ResponseEntity<>(changes, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShiftChange> getShiftChangeById(@PathVariable Long id) {
        return shiftChangeService.getShiftChangeById(id)
                .map(change -> new ResponseEntity<>(change, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Endpoint: Get shift history for a specific doctor
    // Example: GET /api/shift-changes/doctor/5
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<ShiftChange>> getHistoryByDoctor(@PathVariable Long doctorId) {
        List<ShiftChange> history = shiftChangeService.getHistoryByDoctor(doctorId);
        return new ResponseEntity<>(history, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ShiftChange> updateShiftChange(@PathVariable Long id, @RequestBody ShiftChange shiftChange) {
        ShiftChange updated = shiftChangeService.updateShiftChange(id, shiftChange);
        if (updated != null) {
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteShiftChange(@PathVariable Long id) {
        if (shiftChangeService.deleteShiftChange(id)) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}