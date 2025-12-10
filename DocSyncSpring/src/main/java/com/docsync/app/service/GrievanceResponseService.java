package com.docsync.app.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.docsync.app.bean.GrievanceResponse;
import com.docsync.app.dao.GrievanceResponseRepository;

@Service
public class GrievanceResponseService {
   
	@Autowired 
	private GrievanceResponseRepository grepo;
	
	public GrievanceResponse add(GrievanceResponse gr) {
		return grepo.save(gr);
	}
	
	public GrievanceResponse update(Long id,GrievanceResponse details) {
		GrievanceResponse update=grepo.getReferenceById(id);
		
		update.setTicket(details.getTicket());
		update.setResponder(details.getResponder());
		update.setMessage(details.getMessage());
		update.setRespondedAt(details.getRespondedAt());
		
		return grepo.save(update);
	}
	
	public void deletById(Long id) {
		if(!grepo.existsById(id)) {
			throw new RuntimeException("GrievanceResponse not found");
		}
		grepo.deleteById(id);
	}
	
	public List<GrievanceResponse> getAllGrievanceResponses(){
		return grepo.findAll();
	}
	
}
