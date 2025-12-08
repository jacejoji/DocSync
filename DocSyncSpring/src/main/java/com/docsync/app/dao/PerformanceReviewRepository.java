package com.docsync.app.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.docsync.app.bean.PerformanceReview;

@Repository
public interface PerformanceReviewRepository extends JpaRepository<PerformanceReview,Long>{

}
