package com.docsync.app.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.docsync.app.bean.DoctorDocument;

@Repository
public interface DoctorDocumentRepository extends JpaRepository<DoctorDocument,Long> {

}
