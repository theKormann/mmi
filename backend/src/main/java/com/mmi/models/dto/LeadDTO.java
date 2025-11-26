package com.mmi.models.dto;

import lombok.Data;

@Data
public class LeadDTO {
    private String nome;
    private String email;
    private String telefone;
    private String status;
    private String interesse;
    private String origem;
    private Long propertyId;
    private String visitorId;
    private String descricao;
}
