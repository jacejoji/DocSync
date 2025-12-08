package com.docsync.app.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.docsync.app.bean.TaskAssignment;

@Repository
public interface TaskAssignmentRepository extends JpaRepository<TaskAssignment,Long>{

}
