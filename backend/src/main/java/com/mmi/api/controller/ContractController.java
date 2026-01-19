package com.mmi.api.controller;

import com.mmi.api.services.ContractService;
import com.mmi.models.Contract;
import com.mmi.models.Signature;
import com.mmi.models.dto.ClauseDTO;
import com.mmi.models.dto.CreateContractRequest;
import com.mmi.models.dto.SignatureDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
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
    public ResponseEntity<?> createContract(@RequestBody CreateContractRequest request) {
        try {
            // Tenta criar o contrato
            Contract contract = contractService.createContractForSigning(request);
            return ResponseEntity.ok(contract.getUuid());
        } catch (Exception e) {
            // IMPRIME O ERRO REAL NO CONSOLE
            e.printStackTrace();
            // Retorna o erro para quem chamou a API
            return ResponseEntity.internalServerError().body("Erro ao criar contrato: " + e.getMessage());
        }
    }

    @GetMapping("/{uuid}")
    public ResponseEntity<Contract> getContract(@PathVariable UUID uuid) {
        Contract contract = contractService.getContractByUuid(uuid);
        return ResponseEntity.ok(contract);
    }

    @PostMapping("/{uuid}/signatures")
    public ResponseEntity<?> addSignature(
                                           @PathVariable UUID uuid,
                                           @RequestBody SignatureDTO signatureDTO) {

        try {
            Signature newSignature = contractService.addSignerToContract(uuid, signatureDTO);
            return new ResponseEntity<>(newSignature, HttpStatus.CREATED);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Erro ao processar assinatura: " + e.getMessage());
        }
    }

}
