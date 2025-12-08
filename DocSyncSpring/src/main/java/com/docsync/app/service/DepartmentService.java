package com.docsync.app.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.docsync.app.bean.Department;
import com.docsync.app.dao.DepartmentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    // 1. Create
    public Department createDepartment(Department department) {
        if (departmentRepository.existsByName(department.getName())) {
            throw new IllegalArgumentException("Department with this name already exists");
        }
        return departmentRepository.save(department);
    }

    // 2. Read All (For dropdowns)
    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    // 3. Read One
    public Department getDepartmentById(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found with id: " + id));
    }

    // 4. Update
    public Department updateDepartment(Long id, Department details) {
        Department existing = getDepartmentById(id); // Re-use get method to check existence
        
        existing.setName(details.getName());
        existing.setDescription(details.getDescription());
        
        return departmentRepository.save(existing);
    }

    // 5. Delete
    public void deleteDepartment(Long id) {
        if (!departmentRepository.existsById(id)) {
            throw new RuntimeException("Department not found with id: " + id);
        }
        departmentRepository.deleteById(id);
    }
}