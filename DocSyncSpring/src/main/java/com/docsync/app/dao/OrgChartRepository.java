package com.docsync.app.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.docsync.app.bean.OrgChart;

@Repository
public interface OrgChartRepository extends JpaRepository<OrgChart,Long>{

}
