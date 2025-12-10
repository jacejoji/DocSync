package com.docsync.app.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.docsync.app.bean.Promotion;
import com.docsync.app.dao.PromotionRepository;

@Service
public class PromotionService {

    @Autowired
    private PromotionRepository promotionRepository;

    public Promotion promoteDoctor(Promotion promotion) {
        if (promotion.getPromotionDate() == null) {
            promotion.setPromotionDate(LocalDate.now());
        }
        return promotionRepository.save(promotion);
    }

    public List<Promotion> getPromotionsByDoctor(Long doctorId) {
        return promotionRepository.findByDoctorId(doctorId);
    }

    public List<Promotion> getAllPromotions() {
        return promotionRepository.findAll();
    }
}