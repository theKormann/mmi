package com.mmi.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty; // 1. IMPORTAR
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.Base64;
import lombok.Data;

@Data
@Entity
@Table(name = "contracts")
public class Contract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, updatable = false)
    private UUID uuid;

    @Column(name = "pdf_data", columnDefinition = "bytea")
    @JsonIgnore
    private byte[] pdfData;

    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Signature> signatures = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (uuid == null) {
            uuid = UUID.randomUUID();
        }
    }

    @JsonProperty("pdfData")
    public String getPdfDataAsBase64() {
        if (this.pdfData != null) {
            return Base64.getEncoder().encodeToString(this.pdfData);
        }
        return null;
    }
}