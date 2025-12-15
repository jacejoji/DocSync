package com.docsync.app.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.docsync.app.bean.Doctor;
import com.docsync.app.dao.DoctorRepository;

@Service
public class DoctorService {

	@Autowired
	private DoctorRepository drepo;
	
	//add
	public Doctor add(Doctor d) {
		return drepo.save(d);
	}
	
	//update by id
	public Doctor update(Long id,Doctor details) {
		Doctor doc = drepo.getReferenceById(id);

        doc.setFirstName(details.getFirstName());
        doc.setLastName(details.getLastName());
        doc.setEmail(details.getEmail());
        doc.setPhone(details.getPhone());
        doc.setSpecialization(details.getSpecialization());
        doc.setDepartment(details.getDepartment());
        doc.setHireDate(details.getHireDate());
        doc.setStatus(details.getStatus());
        
        return drepo.save(doc);
	}
	
	//delete by id
	public void deleteById(Long id) {
		if (!drepo.existsById(id)) {
            throw new RuntimeException("Doctor not found with this id: " + id);
        }
	   drepo.deleteById(id);
	}
	
	//view all
	public List<Doctor> getAllDoctors(){
		return drepo.findAll();
	}
	
	//find by email
	public Optional<Doctor> findByEmail(String email){
		return drepo.findByEmail(email);
	}
	
	//find by department
	public List<Doctor> findByDepartmentId(Long departmentId){
		return drepo.findByDepartmentId(departmentId);
	}
	
	//find by status
	public  List<Doctor> findByStatus(String status){
		return drepo.findByStatus(status);
	}
	
	//find by id
	public Optional<Doctor> findById(Long id){
		return drepo.findById(id);
	}
	
}
