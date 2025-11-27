package com.mmi.models.dto;

import java.util.List;
import lombok.Data;

@Data
public class CreateContractRequest {
    private String title;
    private List<ClauseDTO> clauses;
}