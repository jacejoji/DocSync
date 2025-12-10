package com.docsync.app.controller;

import java.util.List;
import java.util.Optional;

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

import com.docsync.app.bean.Doctor;
import com.docsync.app.service.DoctorService;



@RestController
@RequestMapping("/doctor")
public class DoctorController {

	@Autowired
	private DoctorService doctorService;
	
	// Add doctor
    @PostMapping
    public ResponseEntity<Doctor> addDoctor(@RequestBody Doctor doctor) {
        Doctor savedDoctor = doctorService.add(doctor);
        return new ResponseEntity<>(savedDoctor, HttpStatus.CREATED);
    }

    // Update doctor by id
    @PutMapping("/{id}")
    public ResponseEntity<Doctor> updateDoctor(@PathVariable Long id, @RequestBody Doctor details) {
        try {
            Doctor updatedDoctor = doctorService.update(id, details);
            return new ResponseEntity<>(updatedDoctor, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // Delete doctor by id
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDoctor(@PathVariable Long id) {
        try {
            doctorService.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    
 // View all doctors
    @GetMapping
    public ResponseEntity<List<Doctor>> getAllDoctors() {
        List<Doctor> doctors = doctorService.getAllDoctors();
        return new ResponseEntity<>(doctors, HttpStatus.OK);
    }

    // Find doctor by email
    @GetMapping("/email/{email}")
    public ResponseEntity<Doctor> findByEmail(@PathVariable String email) {
        Optional<Doctor> doctor = doctorService.findByEmail(email);
        return doctor.map(value -> new ResponseEntity<>(value, HttpStatus.OK))
                     .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Find doctors by department
    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<Doctor>> findByDepartment(@PathVariable Long departmentId) {
        List<Doctor> doctors = doctorService.findByDepartmentId(departmentId);
        return new ResponseEntity<>(doctors, HttpStatus.OK);
    }

    // Find doctors by status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Doctor>> findByStatus(@PathVariable String status) {
        List<Doctor> doctors = doctorService.findByStatus(status);
        return new ResponseEntity<>(doctors, HttpStatus.OK);
    }


}
