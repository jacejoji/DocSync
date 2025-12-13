package com.docsync.app.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.docsync.app.bean.GrievanceTicket;

@Repository
public interface GrievanceTicketRepository extends JpaRepository<GrievanceTicket,Long> {
	//find tickets by doctor id
	List<GrievanceTicket> findByDoctorId(Long id);
}
