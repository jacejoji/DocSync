package com.docsync.app.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.docsync.app.bean.SalaryRecord;

@Repository
public interface SalaryRecordRepository extends JpaRepository<SalaryRecord,Long>{

}
