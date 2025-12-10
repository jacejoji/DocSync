package com.docsync.app.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.docsync.app.bean.InsuranceProvider;
import com.docsync.app.dao.InsuranceProviderRepository;

@Service

public class InsuranceProviderService {

	@Autowired
	private InsuranceProviderRepository iprepo;
	
	//add
	public InsuranceProvider add(InsuranceProvider ip) {
		return iprepo.save(ip);
	}
	
	//update by id
	public InsuranceProvider update(Long id,InsuranceProvider details) {
		InsuranceProvider update=iprepo.getReferenceById(id);
		
		update.setProviderName(details.getProviderName());
		update.setContactNumber(details.getContactNumber());
		update.setEmail(details.getEmail());
		update.setWebsite(details.getWebsite());
		update.setAddress(details.getAddress());
		update.setSupportContactPerson(details.getSupportContactPerson());
		
		return iprepo.save(update);
		
	}
	
	//delete by id
	public void deleteById(Long id) {
		if(!iprepo.existsById(id)){
			throw new RuntimeException("Insurance provider not found with this id"+id);
		}
		iprepo.deleteById(id);
	}
	
	//view all
	public List<InsuranceProvider> getAllInsuranceProviders(){
		return iprepo.findAll();
	}
	
	//find by provider name
	 public List<InsuranceProvider> findByProviderName(String name) {
	        if (name == null || name.trim().isEmpty()) {
	            throw new RuntimeException("Provider name cannot be null or empty");
	        }
	        return iprepo.findByProviderNameContainingIgnoreCase(name);
	    }
}
