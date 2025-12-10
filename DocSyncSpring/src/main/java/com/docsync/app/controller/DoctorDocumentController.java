package com.docsync.app.controller;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.docsync.app.bean.DoctorDocument;
import com.docsync.app.service.DoctorDocumentService;
import org.springframework.core.io.Resource;

@RestController
@RequestMapping("/doctor-documents")
public class DoctorDocumentController {

    @Autowired
    private DoctorDocumentService documentService;

    // Upload
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DoctorDocument> uploadDocument(
            @RequestParam("doctorId") Long doctorId,
            @RequestParam("file") MultipartFile file) {
        try {
            return ResponseEntity.ok(documentService.uploadDocument(doctorId, file));
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // Get List
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<DoctorDocument>> getDocumentsByDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(documentService.getDocumentsByDoctorId(doctorId));
    }

    // Download/View File
    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id) {
        try {
            DoctorDocument doc = documentService.getDocumentById(id);
            Path path = Paths.get(doc.getFilePath());
            Resource resource = new UrlResource(path.toUri());

            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(doc.getDocumentType()))
                        // "inline" allows viewing in browser (like PDFs), change to "attachment" to force download
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + doc.getDocumentName() + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (MalformedURLException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    // Delete
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteDocument(@PathVariable Long id) {
        try {
            documentService.deleteDocument(id);
            return ResponseEntity.ok("File deleted successfully");
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Could not delete file from storage");
        }
    }
}