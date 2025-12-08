package com.docsync.app.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.docsync.app.bean.TrainingPeriod;

@Repository
public interface TrainingPeriodRepository extends JpaRepository<TrainingPeriod,Long>{

}
