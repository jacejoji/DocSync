package com.docsync.app.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.docsync.app.bean.DoctorTrainingStatus;

@Repository
public interface DoctorTrainingStatusRepository extends JpaRepository<DoctorTrainingStatus,Long>{
	List<DoctorTrainingStatus> findByDoctorId(Long doctorId);

    // Find all records for a specific training module
    List<DoctorTrainingStatus> findByTrainingId(Long trainingId);
    
    // Find specific record by doctor and training
    DoctorTrainingStatus findByDoctorIdAndTrainingId(Long doctorId, Long trainingId);
}
