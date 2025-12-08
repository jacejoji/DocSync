package com.docsync.app.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.docsync.app.bean.DoctorInsurancePolicy;

@Repository
public interface DoctorInsurancePolicyRepository extends JpaRepository<DoctorInsurancePolicy,Long> {

}
