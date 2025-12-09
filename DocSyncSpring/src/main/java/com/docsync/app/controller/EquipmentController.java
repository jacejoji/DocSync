package com.docsync.app.controller;

import java.util.List;
import java.util.Optional;

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
import com.docsync.app.bean.Equipment;
import com.docsync.app.service.EquipmentService;

import io.swagger.v3.oas.annotations.parameters.RequestBody;

@RestController
@RequestMapping("/equipment")

public class EquipmentController {

	@Autowired
	private EquipmentService eserv;
	
	//Add Equipment
    @PostMapping
    public ResponseEntity<Equipment> addEquipment(@RequestBody Equipment equipment) {
        Equipment saved = eserv.add(equipment);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    // Update Equipment by ID
    @PutMapping("/{id}")
    public ResponseEntity<Equipment> updateEquipment(@PathVariable Long id, @RequestBody Equipment details) {
        try {
            Equipment updated = eserv.update(id, details);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    //Delete Equipment by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteEquipment(@PathVariable Long id) {
        try {
            eserv.delete(id);
            return new ResponseEntity<>("Equipment deleted successfully!", HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>("Equipment not found!", HttpStatus.NOT_FOUND);
        }
    }
    
    // GET /equipments
       @GetMapping
       public ResponseEntity<List<Equipment>> getAllEquipments() {
           return ResponseEntity.ok(eserv.getAllEquipments());
       }
    
 // Get Equipment by Status
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Equipment>> getEquipmentByStatus(@PathVariable String status) {
        List<Equipment> equipmentList = eserv.getEquipmentByStatus(status);
        if (equipmentList.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(equipmentList, HttpStatus.OK);
    }

    // Get Equipment by Serial Number
    @GetMapping("/serial/{serialNumber}")
    public ResponseEntity<Equipment> getEquipmentBySerialNumber(@PathVariable String serialNumber) {
        Optional<Equipment> equipment = eserv.getEquipmentBySerialNumber(serialNumber);
        return equipment.map(ResponseEntity::ok)
                        .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }
}
