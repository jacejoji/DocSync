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

import com.docsync.app.bean.PerformanceReview;
import com.docsync.app.service.PerformanceReviewService;

@RestController
@RequestMapping("/api/performance-reviews")
public class PerformanceReviewController {

    @Autowired
    private PerformanceReviewService performanceReviewService;

    @PostMapping
    public ResponseEntity<PerformanceReview> createReview(@RequestBody PerformanceReview review) {
        PerformanceReview createdReview = performanceReviewService.createReview(review);
        return new ResponseEntity<>(createdReview, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<PerformanceReview>> getAllReviews() {
        List<PerformanceReview> reviews = performanceReviewService.getAllReviews();
        return new ResponseEntity<>(reviews, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PerformanceReview> getReviewById(@PathVariable Long id) {
        return performanceReviewService.getReviewById(id)
                .map(review -> new ResponseEntity<>(review, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Endpoint to get all reviews for a specific doctor
    // Example: GET /api/performance-reviews/doctor/5
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<PerformanceReview>> getReviewsForDoctor(@PathVariable Long doctorId) {
        List<PerformanceReview> reviews = performanceReviewService.getReviewsForDoctor(doctorId);
        return new ResponseEntity<>(reviews, HttpStatus.OK);
    }

    // Endpoint to get all reviews written by a specific user
    // Example: GET /api/performance-reviews/reviewer/2
    @GetMapping("/reviewer/{reviewerId}")
    public ResponseEntity<List<PerformanceReview>> getReviewsByReviewer(@PathVariable Long reviewerId) {
        List<PerformanceReview> reviews = performanceReviewService.getReviewsByReviewer(reviewerId);
        return new ResponseEntity<>(reviews, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PerformanceReview> updateReview(@PathVariable Long id, @RequestBody PerformanceReview review) {
        PerformanceReview updatedReview = performanceReviewService.updateReview(id, review);
        if (updatedReview != null) {
            return new ResponseEntity<>(updatedReview, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        if (performanceReviewService.deleteReview(id)) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}