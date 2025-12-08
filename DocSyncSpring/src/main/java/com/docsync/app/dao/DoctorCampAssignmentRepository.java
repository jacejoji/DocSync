package com.docsync.app.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.docsync.app.bean.DoctorCampAssignment;

@Repository
public interface DoctorCampAssignmentRepository  extends JpaRepository<DoctorCampAssignment,Long>{

}
