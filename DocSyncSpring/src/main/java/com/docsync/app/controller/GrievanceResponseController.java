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

import com.docsync.app.bean.GrievanceResponse;
import com.docsync.app.service.GrievanceResponseService;

@RestController
@RequestMapping("/grievanceresponse")
public class GrievanceResponseController {

	@Autowired
	private GrievanceResponseService grserv;
	
	@PostMapping
	public ResponseEntity<GrievanceResponse> add(@RequestBody GrievanceResponse gr){
		GrievanceResponse save=grserv.add(gr);
		return new ResponseEntity<>(save,HttpStatus.CREATED);
	}
	
	@PutMapping("/{id}")
	public ResponseEntity<GrievanceResponse> update(@PathVariable Long id,@RequestBody GrievanceResponse gri){
		try {
			GrievanceResponse commit=grserv.update(id, gri);
			return new ResponseEntity<>(commit,HttpStatus.OK);
		}
		catch(RuntimeException e) {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
	}
	
	@DeleteMapping("/{id}")
	public ResponseEntity<String> delete(@PathVariable Long id){
		try {
			grserv.deletById(id);
			return new ResponseEntity<>("Grievance Response deleted successfully",HttpStatus.NO_CONTENT);
		}
		catch(RuntimeException e) {
			return new ResponseEntity<>("Grievance Response not found",HttpStatus.NOT_FOUND);
		}
	}
	
	@GetMapping
	public ResponseEntity<List<GrievanceResponse>> getAllResponses(){
		return ResponseEntity.ok(grserv.getAllGrievanceResponses());
	}
}
