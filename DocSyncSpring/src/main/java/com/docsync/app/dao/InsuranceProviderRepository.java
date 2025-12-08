package com.docsync.app.dao;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.docsync.app.bean.InsuranceProvider;

@Repository
public interface InsuranceProviderRepository extends JpaRepository<InsuranceProvider, Long> {
    List<InsuranceProvider> findByProviderNameContainingIgnoreCase(String name);
}