package com.mmi.models;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import com.mmi.models.Signature;
import java.util.UUID;
import lombok.Data;

@Data
@Entity
@Table(name = "contracts")
public class Contract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private UUID uuid = UUID.randomUUID();

    @Lob 
    @Column(name = "pdf_data", columnDefinition = "BYTEA")
    private byte[] pdfData;

    // Um contrato pode ter várias assinaturas
    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Signature> signatures = new ArrayList<>();

}