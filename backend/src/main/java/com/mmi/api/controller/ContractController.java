package com.mmi.api.controller;

import com.mmi.api.services.ContractService;
import com.mmi.models.Clause; // Importe a entidade
import com.mmi.models.dto.ClauseDTO;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
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

    @GetMapping
    public ResponseEntity<List<Clause>> getAllClauses() {
        List<Clause> clauses = contractService.findAllClauses();
        return ResponseEntity.ok(clauses);
    }

    @PostMapping
    public ResponseEntity<Clause> createClause(@RequestBody ClauseDTO clauseDTO) {
        Clause newClause = contractService.createClause(clauseDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(newClause);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Clause> updateClause(@PathVariable Long id, @RequestBody ClauseDTO clauseDTO) {
        Clause updatedClause = contractService.updateClause(id, clauseDTO);
        return ResponseEntity.ok(updatedClause);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClause(@PathVariable Long id) {
        contractService.deleteClause(id);
        return ResponseEntity.noContent().build();
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