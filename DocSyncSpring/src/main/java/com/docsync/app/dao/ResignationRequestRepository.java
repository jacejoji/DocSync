package com.docsync.app.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.docsync.app.bean.ResignationRequest;

@Repository
public interface ResignationRequestRepository extends JpaRepository<ResignationRequest,Long>{

}
