package com.docsync.app.dao;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.docsync.app.bean.OrgChart;

@Repository
public interface OrgChartRepository extends JpaRepository<OrgChart,Long>{
	List<OrgChart> findByManagerId(Long managerId);
	Optional<OrgChart> findByDoctorId(Long doctorId);
}
