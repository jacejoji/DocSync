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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.docsync.app.bean.ComplianceTraining;
import com.docsync.app.service.ComplianceTrainingService;

@RestController
@RequestMapping("/compliancetraining")
public class ComplianceTrainingController {

	@Autowired
	private ComplianceTrainingService ctserv;
	
	@PostMapping
	public ResponseEntity<ComplianceTraining> add(@RequestBody ComplianceTraining ct){
		ComplianceTraining save=ctserv.add(ct);
		return new ResponseEntity<>(save,HttpStatus.CREATED);
	}
	
	@PutMapping("/{id}")
	public ResponseEntity<ComplianceTraining> update(@PathVariable Long id,@RequestBody ComplianceTraining details){
		try {
			ComplianceTraining commit=ctserv.update(id, details);
			return new ResponseEntity<>(commit,HttpStatus.OK);
		}
		catch(RuntimeException e) {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
	}
	
	@DeleteMapping("/{id}")
	public ResponseEntity<String> delete(@PathVariable Long id){
		try {
			ctserv.deleteById(id);
			return new ResponseEntity<>("Compliance Training deleted successfully",HttpStatus.NO_CONTENT);
		}
		catch(RuntimeException e) {
			return new ResponseEntity<>("Compliance Training not found",HttpStatus.NOT_FOUND);
		}
	}
	
	@GetMapping
	public ResponseEntity<List<ComplianceTraining>> getAllComplianceTrainings(){
		return ResponseEntity.ok(ctserv.getAllComplianceTrainings());
	}
}
