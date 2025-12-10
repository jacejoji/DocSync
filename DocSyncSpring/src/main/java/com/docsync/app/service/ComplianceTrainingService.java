package com.docsync.app.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.docsync.app.bean.ComplianceTraining;
import com.docsync.app.dao.ComplianceTrainingRepository;

@Service

public class ComplianceTrainingService {

	@Autowired
	private ComplianceTrainingRepository ctrepo;
	
	public ComplianceTraining add(ComplianceTraining ct) {
		return ctrepo.save(ct);
	}
	
	public ComplianceTraining update(Long id,ComplianceTraining details) {
		ComplianceTraining updated=ctrepo.getReferenceById(id);
		
		updated.setTitle(details.getTitle());
		updated.setDescription(details.getDescription());
		updated.setMandatory(details.getMandatory());
		updated.setCreatedAt(details.getCreatedAt());
		
		return ctrepo.save(updated);
	}
	
	public void deleteById(Long id) {
		if(!ctrepo.existsById(id)) {
			throw new RuntimeException("ComplianceTraining details not found");
		}
		ctrepo.deleteById(id);
	}
	
	public List<ComplianceTraining> getAllComplianceTrainings(){
		return ctrepo.findAll();
	}
}
