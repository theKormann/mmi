package com.mmi.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mmi.api.services.ContractService;
import com.mmi.models.Contract;
import com.mmi.models.Signature;
import com.mmi.models.dto.CreateContractRequest;
import com.mmi.models.dto.SignatureDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/contracts")
public class ContractController {

    private final ContractService contractService;
    private final ObjectMapper objectMapper; // Instância do Jackson para converter String em Objeto

    public ContractController(ContractService contractService, ObjectMapper objectMapper) {
        this.contractService = contractService;
        this.objectMapper = objectMapper;
    }


    @GetMapping
    public List<Contract> getAllContracts() {
        return contractService.findAllContracts();
    }

    // ALTERADO: Agora aceita Multipart Form Data (JSON + Arquivos)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createContract(
            @RequestPart("data") String contractDataJson, // Recebe o JSON como String
            @RequestPart(value = "files", required = false) List<MultipartFile> files // Recebe a lista de arquivos
    ) {
        try {
            // Converte manualmente a String JSON para o objeto CreateContractRequest
            CreateContractRequest request = objectMapper.readValue(contractDataJson, CreateContractRequest.class);

            // Chama o serviço passando os arquivos
            Contract contract = contractService.createContractWithImages(request, files);

            return ResponseEntity.ok(contract.getUuid());
        } catch (Exception e) {
            e.printStackTrace();
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

    @PutMapping("/{uuid}")
    public ResponseEntity<Contract> updateContract(@PathVariable UUID uuid, @RequestBody CreateContractRequest request) {
        Contract updated = contractService.updateContract(uuid, request.getTitle());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{uuid}")
    public ResponseEntity<Void> deleteContract(@PathVariable UUID uuid) {
        contractService.deleteContract(uuid);
        return ResponseEntity.noContent().build();
    }

}