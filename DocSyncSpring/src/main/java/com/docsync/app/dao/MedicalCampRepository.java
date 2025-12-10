package com.docsync.app.dao;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.docsync.app.bean.MedicalCamp;

@Repository
public interface MedicalCampRepository extends JpaRepository<MedicalCamp,Long>{
List<MedicalCamp> findByDateAfter(LocalDate date);
    
    // Custom finder to search by name
    List<MedicalCamp> findByCampNameContainingIgnoreCase(String name);
}
