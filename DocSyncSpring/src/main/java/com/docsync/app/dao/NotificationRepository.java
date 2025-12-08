package com.docsync.app.dao;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.docsync.app.bean.Notification;

@Repository
public interface NotificationRepository extends JpaRepository<Notification,Long> {

}
