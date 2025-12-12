package com.docsync.app.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.docsync.app.bean.Doctor;
import com.docsync.app.bean.OrgChart;
import com.docsync.app.bean.Promotion;
import com.docsync.app.dao.DepartmentRepository;
import com.docsync.app.dao.DoctorRepository;
import com.docsync.app.dao.OrgChartRepository;
import com.docsync.app.dao.PromotionRepository;

@Service
public class OrgChartService {

    @Autowired
    private OrgChartRepository orgChartRepository;
    @Autowired
    private DepartmentRepository departmentRepository;
    @Autowired
    private DoctorRepository doctorRepository; // Assumes Doctor entity exists
    @Autowired
    private PromotionRepository promotionRepository;

    public Map<String, Object> getRawGraphData() {
        Map<String, Object> response = new HashMap<>();

        // 1. Departments (These will become Group Nodes in ReactFlow)
        response.put("departments", departmentRepository.findAll());

        // 2. Relationships (These will become Edges)
        response.put("relationships", orgChartRepository.findAll());

        // 3. Employees (These will become Child Nodes)
        // We iterate doctors to inject their "Current Title" from the Promotion table
        List<Doctor> allDoctors = doctorRepository.findAll();
        List<Map<String, Object>> enrichedEmployees = new ArrayList<>();

        for (Doctor doc : allDoctors) {
            Map<String, Object> employeeData = new HashMap<>();
            employeeData.put("id", doc.getId());
            employeeData.put("firstName", doc.getFirstName());
            employeeData.put("lastName", doc.getLastName());
            
            // Handle Department Association
            if (doc.getDepartment() != null) {
                employeeData.put("departmentId", doc.getDepartment().getId());
                employeeData.put("departmentName", doc.getDepartment().getName());
            }

            // Fetch latest promotion to get current Job Title
            Optional<Promotion> latestPromo = promotionRepository.findTopByDoctorIdOrderByPromotionDateDesc(doc.getId());
            if (latestPromo.isPresent()) {
                employeeData.put("title", latestPromo.get().getNewTitle());
                employeeData.put("lastPromoted", latestPromo.get().getPromotionDate());
            } else {
                employeeData.put("title", "General Doctor"); // Fallback title
            }

            enrichedEmployees.add(employeeData);
        }
        
        response.put("employees", enrichedEmployees);

        return response;
    }

    public OrgChart createRelationship(OrgChart orgChart) {
        return orgChartRepository.save(orgChart);
    }
    public void assignManager(Long doctorId, Long managerId) {
        // 1. Find or Create the relationship entry
        Optional<OrgChart> existingRelationship = orgChartRepository.findByDoctorId(doctorId);
        
        OrgChart relationship;
        if (existingRelationship.isPresent()) {
            relationship = existingRelationship.get();
        } else {
            relationship = new OrgChart();
            relationship.setDoctor(doctorRepository.findById(doctorId).orElseThrow());
        }

        // 2. Handle NULL manager (Creating a Root Node)
        if (managerId != null) {
            relationship.setManager(doctorRepository.findById(managerId).orElseThrow());
        } else {
            // Explicitly set manager to null (They are now a Root/CEO)
            relationship.setManager(null);
        }
        
        orgChartRepository.save(relationship);
    }

    public void removeManager(Long doctorId) {
        Optional<OrgChart> existingRelationship = orgChartRepository.findByDoctorId(doctorId);
        existingRelationship.ifPresent(orgChart -> orgChartRepository.delete(orgChart));
    }
    
}