package com.mmi.api.services;

import com.mmi.infra.ClauseRepository;
import com.mmi.infra.ContractRepository;
import com.mmi.models.Clause;
import com.mmi.models.Contract;
import com.mmi.models.Signature;
import com.mmi.models.dto.ClauseDTO;
import com.mmi.models.dto.SignatureDTO;
import jakarta.persistence.EntityNotFoundException;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
public class ContractService {

    private final ClauseRepository clauseRepository;
    private final ContractRepository contractRepository;

    public ContractService(ClauseRepository clauseRepository, ContractRepository contractRepository) {
        this.clauseRepository = clauseRepository;
        this.contractRepository = contractRepository;
    }

    // ✅ Cria o contrato e salva o PDF em bytes
    public Contract createContractForSigning(List<ClauseDTO> clauses) throws IOException {
        byte[] pdfBytes = generateContractPDF(clauses);

        Contract contract = new Contract();
        contract.setPdfData(pdfBytes);

        return contractRepository.save(contract);
    }

    public Contract getContractByUuid(UUID uuid) {
        return contractRepository.findByUuid(uuid)
                .orElseThrow(() -> new EntityNotFoundException("Contrato não encontrado"));
    }

    public List<Contract> findAllContracts() {
        return contractRepository.findAll();
    }

    public Signature addSignatureToContract(UUID uuid, String signatureBase64) {
        Contract contract = getContractByUuid(uuid);

        Signature newSignature = new Signature();
        newSignature.setSignatureImage(signatureBase64);
        newSignature.setContract(contract);

        contract.getSignatures().add(newSignature);
        contractRepository.save(contract);

        return newSignature;
    }

    public List<Clause> findAllClauses() {
        return clauseRepository.findAll();
    }

    public Clause createClause(ClauseDTO clauseDTO) {
        Clause newClause = new Clause(clauseDTO.getTitle(), clauseDTO.getContent());
        return clauseRepository.save(newClause);
    }

    public Clause updateClause(Long id, ClauseDTO clauseDetails) {
        Clause clause = clauseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Cláusula não encontrada com id: " + id));

        clause.setTitle(clauseDetails.getTitle());
        clause.setContent(clauseDetails.getContent());
        return clauseRepository.save(clause);
    }

    public void deleteClause(Long id) {
        if (!clauseRepository.existsById(id)) {
            throw new EntityNotFoundException("Cláusula não encontrada com id: " + id);
        }
        clauseRepository.deleteById(id);
    }

    public Signature addSignatureToContract(UUID uuid, SignatureDTO signatureDTO) {
        Contract contract = getContractByUuid(uuid);

        Signature newSignature = new Signature();
        newSignature.setSignatureImage(signatureDTO.getSignatureImage());
        newSignature.setSignerName(signatureDTO.getSignerName());
        newSignature.setContract(contract);

        contract.getSignatures().add(newSignature);
        contractRepository.save(contract);

        return newSignature;
    }

    public byte[] generateContractPDF(List<ClauseDTO> clauses) throws IOException {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);

            try (PDPageContentStream content = new PDPageContentStream(document, page)) {
                float margin = 50;
                float yStart = page.getMediaBox().getHeight() - margin;
                float yPosition = yStart;
                float lineSpacing = 16;

                // Título
                content.beginText();
                content.setFont(PDType1Font.HELVETICA_BOLD, 18);
                content.newLineAtOffset(margin, yPosition);
                content.showText("CONTRATO DE PRESTAÇÃO DE SERVIÇOS IMOBILIÁRIOS");
                content.endText();
                yPosition -= 40;

                // Cláusulas
                for (ClauseDTO clause : clauses) {
                    content.beginText();
                    content.setFont(PDType1Font.HELVETICA_BOLD, 14);
                    content.newLineAtOffset(margin, yPosition);
                    content.showText(clause.getTitle());
                    content.endText();
                    yPosition -= 20;

                    content.setFont(PDType1Font.HELVETICA, 12);
                    String[] words = clause.getContent().split(" ");
                    StringBuilder line = new StringBuilder();
                    float maxWidth = page.getMediaBox().getWidth() - 2 * margin;

                    for (String word : words) {
                        String temp = line + word + " ";
                        float textWidth = PDType1Font.HELVETICA.getStringWidth(temp) / 1000 * 12;
                        if (textWidth > maxWidth) {
                            content.beginText();
                            content.newLineAtOffset(margin, yPosition);
                            content.showText(line.toString().trim());
                            content.endText();
                            line = new StringBuilder(word + " ");
                            yPosition -= lineSpacing;
                        } else {
                            line.append(word).append(" ");
                        }
                    }

                    if (!line.isEmpty()) {
                        content.beginText();
                        content.newLineAtOffset(margin, yPosition);
                        content.showText(line.toString().trim());
                        content.endText();
                        yPosition -= lineSpacing * 2;
                    }

                    if (yPosition < 100) {
                        content.close();
                        page = new PDPage();
                        document.addPage(page);
                        yPosition = yStart;
                    }
                }

                yPosition -= 40;
                content.beginText();
                content.setFont(PDType1Font.HELVETICA, 12);
                content.newLineAtOffset(margin, yPosition);
                content.showText("______________________________");
                content.endText();

                yPosition -= 15;
                content.beginText();
                content.newLineAtOffset(margin, yPosition);
                content.showText("Assinatura das partes");
                content.endText();
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            return baos.toByteArray();
        }
    }
}
