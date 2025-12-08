package com.docsync.app.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.docsync.app.bean.PatientRecord;

@Repository
public interface PatientRecordRepository extends JpaRepository<PatientRecord,Long>{

}
