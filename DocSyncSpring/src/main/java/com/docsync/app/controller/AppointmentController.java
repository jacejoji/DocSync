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
import org.springframework.web.bind.annotation.RestController;

import com.docsync.app.bean.Appointment;
import com.docsync.app.service.AppointmentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    // POST: Create
    @PostMapping
    public ResponseEntity<?> createAppointment(@RequestBody Appointment appointment) {
        try {
            Appointment created = appointmentService.createAppointment(appointment);
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (IllegalStateException | IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // GET: All
    @GetMapping
    public ResponseEntity<List<Appointment>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    // GET: By ID
    @GetMapping("/{id}")
    public ResponseEntity<Appointment> getAppointmentById(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.getAppointmentById(id));
    }

    // GET: Upcoming for Doctor (Custom Repo Method)
    @GetMapping("/doctor/{doctorId}/upcoming")
    public ResponseEntity<List<Appointment>> getUpcomingForDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(appointmentService.getUpcomingAppointmentsForDoctor(doctorId));
    }

    // GET: History for Patient (Custom Repo Method)
    @GetMapping("/patient/{patientId}/history")
    public ResponseEntity<List<Appointment>> getPatientHistory(@PathVariable Long patientId) {
        return ResponseEntity.ok(appointmentService.getPatientHistory(patientId));
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAppointment(@PathVariable Long id) {
        appointmentService.deleteAppointment(id);
        return ResponseEntity.noContent().build();
    }
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAppointment(@PathVariable Long id, @RequestBody Appointment appointmentDetails) {
        try {
            Appointment existingAppointment = appointmentService.getAppointmentById(id);
            
            if (existingAppointment == null) {
                return ResponseEntity.notFound().build();
            }

            // Update fields
            existingAppointment.setAppointmentTime(appointmentDetails.getAppointmentTime());
            existingAppointment.setStatus(appointmentDetails.getStatus());
            existingAppointment.setNotes(appointmentDetails.getNotes());
      
            Appointment updated = appointmentService.createAppointment(existingAppointment); 
            
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    
}