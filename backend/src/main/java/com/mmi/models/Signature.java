// src/main/java/com/mmi/models/Signature.java
package com.mmi.models;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "signatures")
public class Signature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Armazena a imagem da assinatura como Base64
    @Lob
    @Column(name = "signature_image", columnDefinition="TEXT")
    private String signatureImage;

    // Várias assinaturas pertencem a um contrato
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id")
    private Contract contract;

}