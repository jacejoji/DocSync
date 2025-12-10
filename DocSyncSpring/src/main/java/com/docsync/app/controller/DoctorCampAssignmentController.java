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

import com.docsync.app.bean.DoctorCampAssignment;
import com.docsync.app.service.DoctorCampAssignmentService;



@RestController
@RequestMapping("/doctorcampassignment")
public class DoctorCampAssignmentController {

	@Autowired
    private DoctorCampAssignmentService doctorCampAssignmentService;

    // Add new assignment
    @PostMapping
    public ResponseEntity<DoctorCampAssignment> addAssignment(@RequestBody DoctorCampAssignment dca) {
        DoctorCampAssignment saved = doctorCampAssignmentService.add(dca);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    // Update assignment by id
    @PutMapping("/{id}")
    public ResponseEntity<DoctorCampAssignment> updateAssignment(@PathVariable Long id,
                                                                 @RequestBody DoctorCampAssignment details) {
        try {
            DoctorCampAssignment updated = doctorCampAssignmentService.update(id, details);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
 // Delete assignment by id
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAssignment(@PathVariable Long id) {
        try {
            doctorCampAssignmentService.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // View all assignments
    @GetMapping
    public ResponseEntity<List<DoctorCampAssignment>> getAllAssignments() {
        List<DoctorCampAssignment> assignments = doctorCampAssignmentService.getAllDoctorCampAssignment();
        return new ResponseEntity<>(assignments, HttpStatus.OK);
    }


	
}
