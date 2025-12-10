package com.docsync.app.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.docsync.app.bean.PerformanceReview;

@Repository
public interface PerformanceReviewRepository extends JpaRepository<PerformanceReview,Long>{
	List<PerformanceReview> findByDoctorId(Long doctorId);

    // Find all reviews written by a specific Reviewer (User)
    List<PerformanceReview> findByReviewerId(Long reviewerId);
}
