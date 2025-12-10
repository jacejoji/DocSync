package com.docsync.app.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.docsync.app.bean.GrievanceTicket;
import com.docsync.app.dao.GrievanceTicketRepository;

@Service
public class GrievanceTicketService {

	@Autowired
	private GrievanceTicketRepository gtrepo;
	
	public GrievanceTicket add(GrievanceTicket gt) {
		return gtrepo.save(gt);
	}
	
	public GrievanceTicket update(Long id,GrievanceTicket details) {
		GrievanceTicket commit=gtrepo.getReferenceById(id);
		
		commit.setDoctor(details.getDoctor());
		commit.setSubject(details.getSubject());
		commit.setDescription(details.getDescription());
		commit.setStatus(details.getStatus());
		commit.setCreatedAt(details.getCreatedAt());
		
		return gtrepo.save(commit);
	}
	
	public void deleteById(Long id) {
		if(!gtrepo.existsById(id)) {
			throw new RuntimeException("Grievance Ticket not found for this id"+id);
		}
		gtrepo.deleteById(id);
	}
	
	public List<GrievanceTicket> getAllGrievanceTickets(){
		return gtrepo.findAll();
	}
}
