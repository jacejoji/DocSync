package com.docsync.app.dao;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.docsync.app.bean.Promotion;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion,Long>{
List<Promotion> findByDoctorId(Long doctorId);
    
    // Efficiently get the most recent promotion for a doctor
    Optional<Promotion> findTopByDoctorIdOrderByPromotionDateDesc(Long doctorId);

}
