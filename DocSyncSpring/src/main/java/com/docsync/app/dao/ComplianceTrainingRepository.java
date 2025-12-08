package com.docsync.app.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.docsync.app.bean.ComplianceTraining;

@Repository
public interface ComplianceTrainingRepository extends JpaRepository<ComplianceTraining,Long>{

}
