package com.docsync.app.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.docsync.app.bean.MedicalCamp;
import com.docsync.app.service.MedicalCampService;

@RestController
@RequestMapping("/api/medical-camps")
@CrossOrigin(origins = "*") // Allow requests from your frontend
public class MedicalCampController {

    @Autowired
    private MedicalCampService medicalCampService;

    @PostMapping
    public ResponseEntity<MedicalCamp> createMedicalCamp(@RequestBody MedicalCamp medicalCamp) {
        MedicalCamp createdCamp = medicalCampService.createMedicalCamp(medicalCamp);
        return new ResponseEntity<>(createdCamp, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<MedicalCamp>> getAllMedicalCamps() {
        List<MedicalCamp> camps = medicalCampService.getAllMedicalCamps();
        return new ResponseEntity<>(camps, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicalCamp> getMedicalCampById(@PathVariable Long id) {
        return medicalCampService.getMedicalCampById(id)
                .map(camp -> new ResponseEntity<>(camp, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Endpoint for fetching only upcoming camps
    @GetMapping("/upcoming")
    public ResponseEntity<List<MedicalCamp>> getUpcomingCamps() {
        List<MedicalCamp> camps = medicalCampService.getUpcomingCamps();
        return new ResponseEntity<>(camps, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicalCamp> updateMedicalCamp(@PathVariable Long id, @RequestBody MedicalCamp medicalCamp) {
        MedicalCamp updatedCamp = medicalCampService.updateMedicalCamp(id, medicalCamp);
        if (updatedCamp != null) {
            return new ResponseEntity<>(updatedCamp, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedicalCamp(@PathVariable Long id) {
        if (medicalCampService.deleteMedicalCamp(id)) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}