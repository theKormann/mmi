package com.mmi.models.dto;

import lombok.Data;

@Data
public class SignatureDTO {
    private String signerName;
    private String email;      // Obrigatório para Clicksign
    private String cpf;        // Obrigatório para validade jurídica
    private String role;
}