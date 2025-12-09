package com.docsync.app.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.docsync.app.bean.DepartmentTransfer;

@Repository
public interface DepartmentTransferRepository extends JpaRepository<DepartmentTransfer,Long> {
	List<DepartmentTransfer> findByDoctorIdOrderByTransferDateDesc(Long doctorId);
}
