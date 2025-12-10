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

import com.docsync.app.bean.GrievanceTicket;
import com.docsync.app.service.GrievanceTicketService;

@RestController
@RequestMapping("/grievanceticket")
public class GrievanceTicketController {

	@Autowired
	private GrievanceTicketService gtserv;
	
	@PostMapping
	 public ResponseEntity<GrievanceTicket> add(@RequestBody GrievanceTicket gt) {
		GrievanceTicket saved = gtserv.add(gt);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

 
    @PutMapping("/{id}")
    public ResponseEntity<GrievanceTicket> update(@PathVariable Long id, @RequestBody GrievanceTicket details) {
        try {
        	GrievanceTicket updated = gtserv.update(id, details);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

   
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        try {
            gtserv.deleteById(id);
            return new ResponseEntity<>("Grievance Ticket deleted successfully!", HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>("Grievance Ticket not found!", HttpStatus.NOT_FOUND);
        }
    }
    
       @GetMapping
       public ResponseEntity<List<GrievanceTicket>> getAllGrievanceTickets() {
           return ResponseEntity.ok(gtserv.getAllGrievanceTickets());
       }
}
