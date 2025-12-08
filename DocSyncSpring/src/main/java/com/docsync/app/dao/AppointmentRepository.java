package com.docsync.app.dao;

import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.processing.Find;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.docsync.app.bean.Appointment;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment,Long> {

	// Find upcoming appointments for a doctor
    List<Appointment> findByDoctorIdAndAppointmentTimeAfterOrderByAppointmentTimeAsc(Long doctorId, LocalDateTime time);

    // Find history for a patient
    List<Appointment> findByPatientIdOrderByAppointmentTimeDesc(Long patientId);

    // Check for overlaps (simplistic approach)
    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId AND " +
           "a.appointmentTime BETWEEN :start AND :end")
    List<Appointment> findConflictingAppointments(@Param("doctorId") Long doctorId, 
                                                  @Param("start") LocalDateTime start, 
                                                  @Param("end") LocalDateTime end);
}
