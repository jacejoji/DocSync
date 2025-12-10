package com.docsync.app.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.docsync.app.bean.OvertimeRecord;
import com.docsync.app.dao.OvertimeRecordRepository;

@Service

public class OvertimeRecordService {

	@Autowired
	private OvertimeRecordRepository orepo;
	
	public OvertimeRecord add(OvertimeRecord over) {
		return orepo.save(over);
	}
	
	public OvertimeRecord update(Long id,OvertimeRecord details) {
		OvertimeRecord commit=orepo.getReferenceById(id);
		
		commit.setDoctor(details.getDoctor());
		commit.setDate(details.getDate());
		commit.setHours(details.getHours());
		
		return orepo.save(commit);
	}
	
	public void deleteById(Long id) {
		if(!orepo.existsById(id)) {
			throw new RuntimeException("Overtime record not found");
		}
	    orepo.deleteById(id);
	}
	
	public List<OvertimeRecord> getAllOvertimeRecords(){
		return orepo.findAll();
	}
}
