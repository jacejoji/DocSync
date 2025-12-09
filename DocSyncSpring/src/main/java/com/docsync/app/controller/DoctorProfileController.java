package com.docsync.app.controller;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.docsync.app.bean.DoctorProfile;
import com.docsync.app.service.DoctorProfileService;

import io.swagger.v3.oas.annotations.parameters.RequestBody;

@RestController
@RequestMapping("/doctorprofile")
public class DoctorProfileController {

	@Autowired
	private DoctorProfileService dpserv;
	
	@PostMapping
	public ResponseEntity<DoctorProfile> add(@RequestBody DoctorProfile dp){
		DoctorProfile docpro=dpserv.add(dp);
		return new ResponseEntity<>(docpro,HttpStatus.CREATED);
	}
	
	@PutMapping("/{id}")
	public ResponseEntity<DoctorProfile> update(@PathVariable Long id,@RequestBody DoctorProfile details){
		try {
			DoctorProfile docpro=dpserv.update(id, details);
			return new ResponseEntity<>(docpro,HttpStatus.OK);
		}
		catch(RuntimeException e) {
			return  new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
	}
	
	@DeleteMapping("/{id}")
	public ResponseEntity<String> delete(@PathVariable Long id){
		try {
			dpserv.deleteById(id);
			return new ResponseEntity<>("Profile deleted successfully",HttpStatus.OK);
		}
		catch(RuntimeException e) {
			return new ResponseEntity<>("Profile not found",HttpStatus.NOT_FOUND);
		}
	}
	
	@GetMapping
	public ResponseEntity<List<DoctorProfile>> getAllDoctorProfile(){
		return ResponseEntity.ok(dpserv.getAllDoctorProfile());
	}
	
	@GetMapping("/{id}")
	public ResponseEntity<DoctorProfile> getDoctorById(@PathVariable Long id){
		Optional<DoctorProfile> find=dpserv.findByDoctorId(id);
		return find.map(ResponseEntity::ok)
                .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
	}
}
