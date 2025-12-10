package com.docsync.app.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.docsync.app.bean.NewApplication;
import com.docsync.app.dao.NewApplicationRepository;

@Service

public class NewApplicationService {

	@Autowired
	private NewApplicationRepository narepo;
	
	public NewApplication add(NewApplication na) {
		return narepo.save(na);
	}
	
	public NewApplication update(Long id,NewApplication details) {
		NewApplication commit=narepo.getReferenceById(id);
		
		commit.setApplicantName(details.getApplicantName());
		commit.setEmail(details.getEmail());
		commit.setPhone(details.getPhone());
		commit.setSpecialization(details.getSpecialization());
		commit.setStatus(details.getStatus());
		commit.setCreatedAt(details.getCreatedAt());
		
		return narepo.save(commit);
	}
	
	public void deletById(Long id) {
		if(!narepo.existsById(id)) {
			throw new RuntimeException("Application not found");
		}
		narepo.deleteById(id);
	}
	
	public List<NewApplication> getAllNewApplications(){
		return narepo.findAll();
	}
}
