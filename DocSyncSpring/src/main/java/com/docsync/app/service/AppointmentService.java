package com.docsync.app.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.docsync.app.bean.Appointment;
import com.docsync.app.dao.AppointmentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;

    // Create / Book Appointment
    public Appointment createAppointment(Appointment appointment) {
        // 1. Basic Validation: Ensure doctor and time are present
        if (appointment.getDoctor() == null || appointment.getAppointmentTime() == null) {
            throw new IllegalArgumentException("Doctor and Appointment Time are required.");
        }

        // 2. Check for Conflicts (30 min slot assumption)
        LocalDateTime startTime = appointment.getAppointmentTime();
        LocalDateTime endTime = startTime.plusMinutes(30); // Assuming 30 min duration

        List<Appointment> conflicts = appointmentRepository.findConflictingAppointments(
                appointment.getDoctor().getId(), 
                startTime, 
                endTime
        );

        if (!conflicts.isEmpty()) {
            throw new IllegalStateException("Doctor is already booked for this time slot.");
        }

        // 3. Save
        return appointmentRepository.save(appointment);
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public Appointment getAppointmentById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found with ID: " + id));
    }

    // Using your custom repository method
    public List<Appointment> getUpcomingAppointmentsForDoctor(Long doctorId) {
        return appointmentRepository.findByDoctorIdAndAppointmentTimeAfterOrderByAppointmentTimeAsc(
                doctorId, 
                LocalDateTime.now()
        );
    }

    // Using your custom repository method
    public List<Appointment> getPatientHistory(Long patientId) {
        return appointmentRepository.findByPatientIdOrderByAppointmentTimeDesc(patientId);
    }

    public void deleteAppointment(Long id) {
        appointmentRepository.deleteById(id);
    }
}