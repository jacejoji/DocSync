package com.docsync.app.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.docsync.app.bean.DoctorCampAssignment;
import com.docsync.app.dao.DoctorCampAssignmentRepository;

@Service
public class DoctorCampAssignmentService {

	@Autowired
	private DoctorCampAssignmentRepository dcarepo;
	
	//add
	public DoctorCampAssignment add(DoctorCampAssignment dca) {
		return dcarepo.save(dca);
	}
	
	//update by id
	public DoctorCampAssignment update(Long id,DoctorCampAssignment details) {
		DoctorCampAssignment doca=dcarepo.getReferenceById(id);
		
		doca.setDoctor(details.getDoctor());
		doca.setCamp(details.getCamp());
		doca.setRole(details.getRole());
        
		return dcarepo.save(doca);
	}
	
	//delete by id
	public void deleteById(Long id) {
		if (!dcarepo.existsById(id)) {
            throw new RuntimeException("DoctorCampAssignment not found with this id: " + id);
        }
        dcarepo.deleteById(id);
	}
	
	//view all
	public List<DoctorCampAssignment> getAllDoctorCampAssignment(){
		return dcarepo.findAll();
	}
}
