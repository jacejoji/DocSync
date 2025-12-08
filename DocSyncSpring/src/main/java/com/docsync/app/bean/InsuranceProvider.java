package com.docsync.app.bean;

import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "insurance_providers")
@Data
@EnableJpaAuditing
public class InsuranceProvider {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "provider_name", nullable = false, length = 200)
    private String providerName;

    @Column(name = "contact_number", length = 50)
    private String contactNumber;

    @Column(length = 150)
    private String email;

    @Column(length = 200)
    private String website;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(name = "support_contact_person", length = 150)
    private String supportContactPerson;
}