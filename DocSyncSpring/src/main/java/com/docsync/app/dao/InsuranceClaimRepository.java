package com.docsync.app.dao;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.docsync.app.bean.InsuranceClaim;

@Repository
public interface InsuranceClaimRepository extends JpaRepository<InsuranceClaim, Long> {
    List<InsuranceClaim> findByStatus(String status);
    
    Optional<InsuranceClaim> findByClaimReferenceNumber(String referenceNumber);
}
