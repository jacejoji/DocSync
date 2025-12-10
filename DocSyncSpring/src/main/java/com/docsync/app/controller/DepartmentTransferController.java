package com.docsync.app.controller;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.docsync.app.bean.DepartmentTransfer;
import com.docsync.app.service.DepartmentTransferService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/transfers")
@RequiredArgsConstructor
public class DepartmentTransferController {

    private final DepartmentTransferService transferService;

    // POST: Initiate a Transfer
    @PostMapping
    public ResponseEntity<?> initiateTransfer(@RequestBody DepartmentTransfer transferRequest) {
        try {
            DepartmentTransfer completedTransfer = transferService.transferDoctor(transferRequest);
            return new ResponseEntity<>(completedTransfer, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    // GET: History of a Doctor
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<DepartmentTransfer>> getDoctorTransferHistory(@PathVariable Long doctorId) {
        return ResponseEntity.ok(transferService.getTransferHistory(doctorId));
    }
}