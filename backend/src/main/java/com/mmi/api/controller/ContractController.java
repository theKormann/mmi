package com.mmi.api.controller;

import com.mmi.models.dto.ClauseDTO;
import com.mmi.api.services.ContractService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/contracts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // caso o frontend Next.js rode em porta diferente
public class ContractController {

    private final ContractService contractService;

    @PostMapping("/pdf")
    public ResponseEntity<byte[]> generateContractPDF(@RequestBody List<ClauseDTO> clauses) {
        try {
            byte[] pdfBytes = contractService.generateContractPDF(clauses);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "contrato.pdf");

            return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(("Erro ao gerar PDF: " + e.getMessage()).getBytes());
        }
    }
}
