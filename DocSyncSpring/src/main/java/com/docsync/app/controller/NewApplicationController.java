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

import com.docsync.app.bean.NewApplication;
import com.docsync.app.service.NewApplicationService;

@RestController
@RequestMapping("/newapplication")
public class NewApplicationController {

	@Autowired 
	private NewApplicationService naserv;
	
	@PostMapping
	public ResponseEntity<NewApplication> add(@RequestBody NewApplication na){
		NewApplication save=naserv.add(na);
		
		return new ResponseEntity<>(save,HttpStatus.CREATED);
	}
	
	@PutMapping("/{id}")
	public ResponseEntity<NewApplication> update(@PathVariable Long id,@RequestBody NewApplication na){
		try {
			NewApplication update=naserv.update(id, na);
			return new ResponseEntity<>(update,HttpStatus.OK);
		}
		catch(RuntimeException e){
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
	}
	
	@DeleteMapping("/{id}")
	public ResponseEntity<String> delete(@PathVariable Long id){
		try {
			naserv.deletById(id);
			return new ResponseEntity<>("Application deleted successfully",HttpStatus.NO_CONTENT);
		}
		catch(RuntimeException e) {
			return new ResponseEntity<>("Application not found",HttpStatus.NOT_FOUND);
		}
	}
	
	@GetMapping
	public ResponseEntity<List<NewApplication>> getAllNewApplications(){
		return ResponseEntity.ok(naserv.getAllNewApplications());
	}
}