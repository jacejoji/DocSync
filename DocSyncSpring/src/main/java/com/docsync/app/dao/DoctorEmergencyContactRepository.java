package com.docsync.app.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.docsync.app.bean.DoctorEmergencyContact;

@Repository
public interface DoctorEmergencyContactRepository extends JpaRepository<DoctorEmergencyContact,Long> {

}
