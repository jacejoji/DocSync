package com.docsync.app.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.docsync.app.bean.DoctorTrainingStatus;

@Repository
public interface DoctorTrainingStatusRepository extends JpaRepository<DoctorTrainingStatus,Long>{

}
