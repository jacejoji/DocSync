package com.docsync.app.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.docsync.app.bean.DoctorDocument;

@Repository
public interface DoctorDocumentRepository extends JpaRepository<DoctorDocument,Long> {
	List<DoctorDocument> findByDoctorId(Long doctorId);

}
