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

import com.docsync.app.bean.InsuranceProvider;
import com.docsync.app.service.InsuranceProviderService;

@RestController
@RequestMapping("/insuranceprovider")
public class InsuranceProviderController {

	@Autowired
	private InsuranceProviderService ipserv;
	
	@PostMapping
	public ResponseEntity<InsuranceProvider> add(InsuranceProvider ip){
		InsuranceProvider save=ipserv.add(ip);
		
		return new ResponseEntity<>(save,HttpStatus.CREATED);
	}
	
	@PutMapping("/{id}")
	public ResponseEntity<InsuranceProvider> update(Long id,InsuranceProvider details){
		try {
		InsuranceProvider update=ipserv.update(id,details);
		return new ResponseEntity<>(update,HttpStatus.OK);
	  }
		catch(RuntimeException e) {
			return new ResponseEntity<>(HttpStatus.NOT_FOUND);
		}
	}
	
	@DeleteMapping("/{id}")
	 public ResponseEntity<String> deleteInsuranceProvider(@PathVariable Long id) {
        try {
            ipserv.deleteById(id);
            return new ResponseEntity<>("InsuranceProvider deleted successfully!", HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>("InsuranceProvidert not found!", HttpStatus.NOT_FOUND);
        }
    }
	
       @GetMapping
       public ResponseEntity<List<InsuranceProvider>> getAllInsuranceProviders() {
           return ResponseEntity.ok(ipserv.getAllInsuranceProviders());
       }
       
       @GetMapping("/name")
       public ResponseEntity<List<InsuranceProvider>> findByProviderName(@PathVariable String name) {
           List<InsuranceProvider> providers = ipserv.findByProviderName(name);
           return ResponseEntity.ok(providers);
       }
}
