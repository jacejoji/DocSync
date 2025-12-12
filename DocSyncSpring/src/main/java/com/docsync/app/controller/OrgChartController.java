package com.docsync.app.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.docsync.app.bean.OrgChart;
import com.docsync.app.service.OrgChartService;

@RestController
@RequestMapping("/api/org-chart")
public class OrgChartController {

    @Autowired
    private OrgChartService orgChartService;

    // Returns raw data: Departments, Enriched Employees, and Relationships
    // Frontend handles ReactFlow node/edge creation
    @GetMapping("/data")
    public ResponseEntity<Map<String, Object>> getOrgChartData() {
        Map<String, Object> data = orgChartService.getRawGraphData();
        return new ResponseEntity<>(data, HttpStatus.OK);
    }

    @PostMapping("/relationship")
    public ResponseEntity<OrgChart> addReportingLine(@RequestBody OrgChart orgChart) {
        OrgChart created = orgChartService.createRelationship(orgChart);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }
    @PostMapping("/assign")
    public ResponseEntity<?> assignManager(@RequestBody Map<String, Long> payload) {
        Long doctorId = payload.get("doctorId");
        Long managerId = payload.get("managerId"); // This will be null if not sent
        
        orgChartService.assignManager(doctorId, managerId);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PostMapping("/remove")
    public ResponseEntity<?> removeManager(@RequestBody Map<String, Long> payload) {
        Long doctorId = payload.get("doctorId");
        orgChartService.removeManager(doctorId);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}