package com.mmi.models.dto;

import lombok.Data;

@Data
public class LeadResponseDTO {
    private Long id;
    private String nome;
    private String email;
    private String telefone;
    private String origem;
    private String status;
    private String interesse;
    private Long propertyId;
    private String propertyTitle;
    private String descricao;
}
