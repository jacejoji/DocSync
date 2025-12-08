package com.docsync.app.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.docsync.app.bean.NewApplication;

@Repository
public interface NewApplicationRepository extends JpaRepository<NewApplication,Long>{

}
