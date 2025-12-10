package com.docsync.app.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.docsync.app.bean.DoctorEmergencyContact;
import com.docsync.app.dao.DoctorEmergencyContactRepository;

@Service
public class DoctorEmergencyContactService {

	@Autowired
	private DoctorEmergencyContactRepository decrepo;
	
	//add
	public DoctorEmergencyContact add(DoctorEmergencyContact dec) {
		return decrepo.save(dec);
	}
	
	//update by id
	public DoctorEmergencyContact update(Long id,DoctorEmergencyContact details) {
		DoctorEmergencyContact updated=decrepo.getReferenceById(id);
		
		updated.setDoctor(details.getDoctor());
		updated.setName(details.getName());
		updated.setRelation(details.getRelation());
		updated.setContact(details.getContact());
		
		return decrepo.save(updated);
	}
	
	//delete by id
	public void deleteById(Long id) {
		if(!decrepo.existsById(id)) {
			throw new RuntimeException("Doctor Emergency Contact not found "+id);
		}
	    decrepo.deleteById(id);
	}
	
	//view all
	public List<DoctorEmergencyContact> getAllDoctorEmergencyContacts(){
		return decrepo.findAll();
	}
}
