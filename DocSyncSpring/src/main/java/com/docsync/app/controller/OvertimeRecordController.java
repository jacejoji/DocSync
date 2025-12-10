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

import com.docsync.app.bean.OvertimeRecord;
import com.docsync.app.service.OvertimeRecordService;

@RestController
@RequestMapping("/overtimerecord")
public class OvertimeRecordController {

	@Autowired
	private OvertimeRecordService oserv;
	
	@PostMapping
	public ResponseEntity<OvertimeRecord> add(@RequestBody OvertimeRecord over){
		OvertimeRecord save=oserv.add(over);
		
		return new ResponseEntity<>(save,HttpStatus.CREATED);
	}
	
	@PutMapping("/{id}")
	public ResponseEntity<OvertimeRecord> update(@PathVariable Long id,@RequestBody OvertimeRecord details){
	  try {
		  OvertimeRecord commit=oserv.update(id, details);
		  return new ResponseEntity<>(commit,HttpStatus.OK);
	  }
	  catch(RuntimeException e) {
		  return new ResponseEntity<>(HttpStatus.NOT_FOUND);
	  }
	}
	
	@DeleteMapping("/{id}")
	public ResponseEntity<String> delete(@PathVariable Long id){
		try {
			oserv.deleteById(id);
			return new ResponseEntity<>("Overtime Record deleted successfully",HttpStatus.NO_CONTENT);
		}
		catch(RuntimeException e) {
			return new ResponseEntity<>("Overtime Record not found",HttpStatus.NOT_FOUND);
		}
	}
	
	@GetMapping
	public ResponseEntity<List<OvertimeRecord>> getAllRecords(){
		return ResponseEntity.ok(oserv.getAllOvertimeRecords());
	}
}
