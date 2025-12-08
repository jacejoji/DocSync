package com.docsync.app.dao;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.docsync.app.bean.Patient;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByEmail(String email);
    List<Patient> findByPhone(String phone);
    List<Patient> findByLastNameContainingIgnoreCase(String lastName);
}
