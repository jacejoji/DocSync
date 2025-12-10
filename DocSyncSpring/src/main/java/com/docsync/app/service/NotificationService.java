package com.docsync.app.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.docsync.app.bean.Notification;
import com.docsync.app.dao.NotificationRepository;

@Service

public class NotificationService {

	@Autowired
	private NotificationRepository norepo;
	
	public Notification add(Notification no) {
		return norepo.save(no);
	}
	
	public Notification update(Long id,Notification details) {
		Notification commit=norepo.getReferenceById(id);
		
		commit.setUser(details.getUser());
		commit.setMessage(details.getMessage());
		commit.setIsRead(details.getIsRead());
		commit.setCreatedAt(details.getCreatedAt());
		return norepo.save(commit);
	}
	
	public void deleteById(Long id) {
		if(!norepo.existsById(id)) {
			throw new RuntimeException("Notification not found");
		}
		norepo.deleteById(id);
	}
	
	public List<Notification> getAllNotifications(){
		return norepo.findAll();
	}
}
