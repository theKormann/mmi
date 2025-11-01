package com.mmi.api.controller;

import com.mmi.api.services.ContractService;
import com.mmi.models.Contract;
import com.mmi.models.dto.ClauseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/contracts") // Rota base para CONTRATOS
public class ContractController {

    private final ContractService contractService;

    public ContractController(ContractService contractService) {
        this.contractService = contractService;
    }

    @PostMapping
    public ResponseEntity<String> createContract(@RequestBody List<ClauseDTO> clauses) throws Exception {
        Contract newContract = contractService.createContractForSigning(clauses);
        return ResponseEntity.ok(newContract.getUuid().toString());
    }

    @GetMapping("/{uuid}")
    public ResponseEntity<Contract> getContract(@PathVariable UUID uuid) {
        Contract contract = contractService.getContractByUuid(uuid);
        return ResponseEntity.ok(contract);
    }

    @PostMapping("/{uuid}/signatures")
    public ResponseEntity<Void> addSignature(@PathVariable UUID uuid, @RequestBody String signatureBase64) {
        contractService.addSignatureToContract(uuid, signatureBase64);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

}