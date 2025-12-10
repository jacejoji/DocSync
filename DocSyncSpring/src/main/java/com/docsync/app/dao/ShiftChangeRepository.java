package com.docsync.app.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.docsync.app.bean.ShiftChange;

@Repository
public interface ShiftChangeRepository extends JpaRepository<ShiftChange,Long>{
	List<ShiftChange> findByDoctorIdOrderByChangeDateDesc(Long doctorId);
}
