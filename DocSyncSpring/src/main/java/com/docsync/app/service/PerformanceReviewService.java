package com.docsync.app.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.docsync.app.bean.PerformanceReview;
import com.docsync.app.dao.PerformanceReviewRepository;

@Service
public class PerformanceReviewService {

    @Autowired
    private PerformanceReviewRepository performanceReviewRepository;

    public PerformanceReview createReview(PerformanceReview review) {
        // Automatically set the review date to today if not provided
        if (review.getReviewDate() == null) {
            review.setReviewDate(LocalDate.now());
        }
        return performanceReviewRepository.save(review);
    }

    public List<PerformanceReview> getAllReviews() {
        return performanceReviewRepository.findAll();
    }

    public Optional<PerformanceReview> getReviewById(Long id) {
        return performanceReviewRepository.findById(id);
    }

    public List<PerformanceReview> getReviewsForDoctor(Long doctorId) {
        return performanceReviewRepository.findByDoctorId(doctorId);
    }

    public List<PerformanceReview> getReviewsByReviewer(Long reviewerId) {
        return performanceReviewRepository.findByReviewerId(reviewerId);
    }

    public PerformanceReview updateReview(Long id, PerformanceReview reviewDetails) {
        return performanceReviewRepository.findById(id).map(existingReview -> {
            existingReview.setComments(reviewDetails.getComments());
            existingReview.setRating(reviewDetails.getRating());
            existingReview.setReviewDate(reviewDetails.getReviewDate());
            // Note: Usually we don't update the Doctor or Reviewer ID after creation
            return performanceReviewRepository.save(existingReview);
        }).orElse(null);
    }

    public boolean deleteReview(Long id) {
        if (performanceReviewRepository.existsById(id)) {
            performanceReviewRepository.deleteById(id);
            return true;
        }
        return false;
    }
}