package com.docsync.app.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.docsync.app.bean.DoctorEquipment;

@Repository
public interface DoctorEquipmentRepository extends JpaRepository<DoctorEquipment,Long> {

}
