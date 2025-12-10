package com.docsync.app.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.docsync.app.bean.Doctor;
import com.docsync.app.bean.DoctorDocument;
import com.docsync.app.dao.DoctorDocumentRepository;
import com.docsync.app.dao.DoctorRepository;

import jakarta.persistence.EntityNotFoundException;

@Service
public class DoctorDocumentService {

    @Autowired
    private DoctorDocumentRepository documentRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    private final Path fileStorageLocation;

    // Constructor injection to read the path from application.properties
    public DoctorDocumentService(@Value("${file.upload-dir}") String uploadDir) {
        // Convert string path to absolute path
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();

        try {
            // Create the directory if it doesn't exist
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the upload directory at " + this.fileStorageLocation, ex);
        }
    }

    public DoctorDocument uploadDocument(Long doctorId, MultipartFile file) throws IOException {
        // 1. Check Doctor
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new EntityNotFoundException("Doctor ID not found: " + doctorId));

        // 2. Sanitize filename
        String originalFileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        if(originalFileName.contains("..")) {
            throw new IOException("Filename contains invalid path sequence " + originalFileName);
        }

        // 3. Generate unique filename to prevent overwrites (UUID + OriginalName)
        String uniqueFileName = UUID.randomUUID().toString() + "_" + originalFileName;

        // 4. Copy file to the target location (Replacing existing if any)
        Path targetLocation = this.fileStorageLocation.resolve(uniqueFileName);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        // 5. Save Metadata to DB
        DoctorDocument doc = new DoctorDocument();
        doc.setDoctor(doctor);
        doc.setDocumentName(originalFileName); // Display name
        doc.setDocumentType(file.getContentType());
        doc.setFilePath(targetLocation.toString()); // Full local path
        doc.setUploadedAt(LocalDateTime.now());

        return documentRepository.save(doc);
    }

    public DoctorDocument getDocumentById(Long id) {
        return documentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Document not found: " + id));
    }

    public List<DoctorDocument> getDocumentsByDoctorId(Long doctorId) {
        return documentRepository.findByDoctorId(doctorId);
    }

    public void deleteDocument(Long id) throws IOException {
        DoctorDocument doc = getDocumentById(id);
        
        // Delete the file from the local folder
        Path filePath = Paths.get(doc.getFilePath());
        Files.deleteIfExists(filePath);

        // Delete the record from the database
        documentRepository.delete(doc);
    }
}