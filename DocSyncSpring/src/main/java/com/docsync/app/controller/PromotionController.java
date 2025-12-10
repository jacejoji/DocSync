package com.docsync.app.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.docsync.app.bean.Promotion;
import com.docsync.app.service.PromotionService;

@RestController
@RequestMapping("/api/promotions")
public class PromotionController {

    @Autowired
    private PromotionService promotionService;

    @PostMapping
    public ResponseEntity<Promotion> createPromotion(@RequestBody Promotion promotion) {
        Promotion savedPromotion = promotionService.promoteDoctor(promotion);
        return new ResponseEntity<>(savedPromotion, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<Promotion>> getAllPromotions() {
        return new ResponseEntity<>(promotionService.getAllPromotions(), HttpStatus.OK);
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Promotion>> getDoctorHistory(@PathVariable Long doctorId) {
        List<Promotion> history = promotionService.getPromotionsByDoctor(doctorId);
        return new ResponseEntity<>(history, HttpStatus.OK);
    }
}