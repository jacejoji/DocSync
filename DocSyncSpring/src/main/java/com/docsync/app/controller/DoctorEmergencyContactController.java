package com.docsync.app.controller;

import java.util.List;

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

import com.docsync.app.bean.DoctorEmergencyContact;
import com.docsync.app.service.DoctorEmergencyContactService;

import io.swagger.v3.oas.annotations.parameters.RequestBody;

@RestController
@RequestMapping("/doctoremergencycontact ")
public class DoctorEmergencyContactController {

	@Autowired
	private DoctorEmergencyContactService decserv;
	
	@PostMapping
	public ResponseEntity<DoctorEmergencyContact> add(@RequestBody DoctorEmergencyContact dec){
		DoctorEmergencyContact add=decserv.add(dec);
		return  new ResponseEntity<>(add,HttpStatus.CREATED);
	}
	
	@PutMapping("/{id}")
	public ResponseEntity<DoctorEmergencyContact> update(@PathVariable Long id,@RequestBody DoctorEmergencyContact details){
		try {
			DoctorEmergencyContact  updated = decserv.update(id, details);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
	}
	
	 //Delete DoctorEmergencyContact by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        try {
            decserv.deleteById(id);
            return new ResponseEntity<>("DoctorEmergencyContact deleted successfully!", HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>("DoctorEmergencyContact not found!", HttpStatus.NOT_FOUND);
        }
    }
    
    // GET all DoctorEmergencyContact
       @GetMapping
       public ResponseEntity<List<DoctorEmergencyContact>> getAllDoctorEmergencyContacts() {
           return ResponseEntity.ok(decserv.getAllDoctorEmergencyContacts());
       }
}
