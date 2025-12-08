package com.docsync.app.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.docsync.app.bean.PaidLeave;

@Repository
public interface PaidLeaveRepository extends JpaRepository<PaidLeave,Long> {

}
