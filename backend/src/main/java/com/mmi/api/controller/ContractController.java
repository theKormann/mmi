package com.mmi.api.controller;

import com.mmi.api.services.ContractService;
import com.mmi.models.dto.ClauseDTO;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clauses")
public class ContractController {

    private final ContractService contractService;

    public ContractController(ContractService contractService) {
        this.contractService = contractService;
    }

    @PostMapping("/pdf")
    public ResponseEntity<byte[]> generateContract(@RequestBody List<ClauseDTO> clauses) throws Exception {
        byte[] pdf = contractService.generateContractPDF(clauses);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=contrato.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
