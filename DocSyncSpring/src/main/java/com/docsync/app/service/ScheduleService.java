package com.docsync.app.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.docsync.app.bean.Doctor;
import com.docsync.app.bean.Schedule;
import com.docsync.app.dao.DoctorRepository;
import com.docsync.app.dao.ScheduleRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final ScheduleRepository scheduleRepository;
    private final DoctorRepository doctorRepository;

    public Schedule createSchedule(Schedule schedule) {
        // Ensure the doctor exists if provided
        if (schedule.getDoctor() != null && schedule.getDoctor().getId() != null) {
            Doctor doctor = doctorRepository.findById(schedule.getDoctor().getId())
                    .orElseThrow(() -> new EntityNotFoundException("Doctor not found"));
            schedule.setDoctor(doctor);
        }
        return scheduleRepository.save(schedule);
    }

    public List<Schedule> getAllSchedules() {
        return scheduleRepository.findAll();
    }

    public Schedule getScheduleById(Long id) {
        return scheduleRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Schedule not found with ID: " + id));
    }

    public List<Schedule> getSchedulesByDoctorId(Long doctorId) {
        return scheduleRepository.findByDoctorId(doctorId);
    }

    public Schedule updateSchedule(Long id, Schedule scheduleDetails) {
        Schedule existingSchedule = getScheduleById(id);

        // Update basic fields
        existingSchedule.setAvailableFrom(scheduleDetails.getAvailableFrom());
        existingSchedule.setAvailableTo(scheduleDetails.getAvailableTo());
        existingSchedule.setDayOfWeek(scheduleDetails.getDayOfWeek());

        // Update Doctor relationship if provided in the payload
        if (scheduleDetails.getDoctor() != null && scheduleDetails.getDoctor().getId() != null) {
            Doctor doctor = doctorRepository.findById(scheduleDetails.getDoctor().getId())
                    .orElseThrow(() -> new EntityNotFoundException("Doctor not found"));
            existingSchedule.setDoctor(doctor);
        }

        return scheduleRepository.save(existingSchedule);
    }

    public void deleteSchedule(Long id) {
        if (!scheduleRepository.existsById(id)) {
            throw new EntityNotFoundException("Schedule not found with ID: " + id);
        }
        scheduleRepository.deleteById(id);
    }
}