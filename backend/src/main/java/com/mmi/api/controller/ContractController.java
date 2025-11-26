package com.mmi.api.controller;

import com.mmi.api.services.ContractService;
import com.mmi.models.Contract;
import com.mmi.models.Signature;
import com.mmi.models.dto.ClauseDTO;
import com.mmi.models.dto.SignatureDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/contracts")
public class ContractController {

    private final ContractService contractService;

    public ContractController(ContractService contractService) {
        this.contractService = contractService;
    }

    @GetMapping
    public List<Contract> getAllContracts() {
        return contractService.findAllContracts();
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
    public ResponseEntity<Signature> addSignature(
            @PathVariable UUID uuid,
            @RequestBody SignatureDTO signatureDTO) {

        Signature newSignature = contractService.addSignatureToContract(uuid, signatureDTO);
        return new ResponseEntity<>(newSignature, HttpStatus.CREATED);
    }
}
