package com.docsync.app.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.docsync.app.bean.Promotion;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion,Long>{

}
