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

import com.docsync.app.bean.Notification;
import com.docsync.app.service.NotificationService;

@RestController
@RequestMapping("/notification")
public class NotificationController {

	@Autowired
	private NotificationService noserv;
	
	@PostMapping
	public ResponseEntity<Notification> add(@RequestBody Notification no){
		Notification save=noserv.add(no);
		
		return new ResponseEntity<>(save,HttpStatus.CREATED);
	}
	
	@PutMapping("/{id}")
	public ResponseEntity<Notification> update(@PathVariable Long id,@RequestBody Notification details){
	  try {
		  Notification commit=noserv.update(id, details);
		  return new ResponseEntity<>(commit,HttpStatus.OK);
	  }
	  catch(RuntimeException e) {
		  return new ResponseEntity<>(HttpStatus.NOT_FOUND);
	  }
	}
	
	@DeleteMapping("/{id}")
	public ResponseEntity<String> delete(@PathVariable Long id){
		try {
			noserv.deleteById(id);
			return new ResponseEntity<>("Notification deleted successfully",HttpStatus.NO_CONTENT);
		}
		catch(RuntimeException e) {
			return new ResponseEntity<>("Notification not found",HttpStatus.NOT_FOUND);
		}
	}
	
	@GetMapping
	public ResponseEntity<List<Notification>> getAllNotification(){
		return ResponseEntity.ok(noserv.getAllNotifications());
	}
}
