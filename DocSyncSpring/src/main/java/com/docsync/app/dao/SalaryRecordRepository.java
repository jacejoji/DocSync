package com.docsync.app.dao;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.docsync.app.bean.SalaryRecord;

@Repository
public interface SalaryRecordRepository extends JpaRepository<SalaryRecord,Long>{
	List<SalaryRecord> findByDoctorIdOrderByEffectiveFromDesc(Long doctorId);

    // Fetch only the most recent (current) salary record for a doctor
    Optional<SalaryRecord> findTopByDoctorIdOrderByEffectiveFromDesc(Long doctorId);

}
