package com.docsync.app.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.docsync.app.bean.DutyRoster;

@Repository
public interface DutyRosterRepository extends JpaRepository<DutyRoster,Long> {

}
