package com.docsync.app.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.docsync.app.bean.Equipment;
import com.docsync.app.dao.EquipmentRepository;

@Service

public class EquipmentService {
	@Autowired
	private EquipmentRepository eqrepo;
	
	//add equipment
	public Equipment add(Equipment eq) {
		return eqrepo.save(eq);
	}
	
	//update by id
	public Equipment update(Long id,Equipment details) {
		Equipment equip = eqrepo.getReferenceById(id);

        equip.setName(details.getName());
        equip.setSerialNumber(details.getSerialNumber());
        equip.setStatus(details.getStatus());
        equip.setPurchaseDate(details.getPurchaseDate());

        return eqrepo.save(equip);

	}
	
	//delete by id
	public void delete(Long id) {
		  if (!eqrepo.existsById(id)) {
	            throw new RuntimeException("Equipment not found with this id: " + id);
	        }
	        eqrepo.deleteById(id);
	}
	
	// read All
    public List<Equipment> getAllEquipments() {
        return eqrepo.findAll();
    }
	
	// Method to find equipment by status
    public List<Equipment> getEquipmentByStatus(String status) {
        return eqrepo.findByStatus(status);
    }

    // Method to find equipment by serial number
    public Optional<Equipment> getEquipmentBySerialNumber(String serialNumber) {
        return eqrepo.findBySerialNumber(serialNumber);
    }
	
}
