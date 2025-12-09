package com.docsync.app.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.docsync.app.bean.DoctorProfile;
import com.docsync.app.dao.DoctorProfileRepository;

@Service
public class DoctorProfileService {
	
	@Autowired
	private DoctorProfileRepository dprepo;
	
	//add a doctor
	public DoctorProfile add(DoctorProfile dp) {
		return dprepo.save(dp);
	}
	
	//update doctor by id
	public DoctorProfile update(Long id,DoctorProfile details) {
		DoctorProfile dopro = dprepo.getReferenceById(id);

        dopro.setDoctor(details.getDoctor());
        dopro.setAddress(details.getAddress());
        dopro.setExperienceYears(details.getExperienceYears());
        dopro.setBio(details.getBio());

        return dprepo.save(dopro);
	}
	
	//delete by id
	public void deleteById(Long id) {
		if (!dprepo.existsById(id)) {
            throw new RuntimeException("DoctorProfile not found with this id: " + id);
        }
        dprepo.deleteById(id);
	}
	
	//view all
	public List<DoctorProfile> getAllDoctorProfile(){
		return dprepo.findAll();
	}
	
	//find doctor by id
	public Optional<DoctorProfile> findByDoctorId(Long Id){
		return dprepo.findByDoctorId(Id);
	}

}
