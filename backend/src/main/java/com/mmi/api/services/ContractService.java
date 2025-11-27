package com.mmi.api.services;

import com.mmi.infra.ClauseRepository;
import com.mmi.infra.ContractRepository;
import com.mmi.models.Clause;
import com.mmi.models.Contract;
import com.mmi.models.Signature;
import com.mmi.models.dto.ClauseDTO;
import com.mmi.models.dto.CreateContractRequest;
import com.mmi.models.dto.SignatureDTO;
import jakarta.persistence.EntityNotFoundException;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.UUID;

@Service
public class ContractService {

    private final ClauseRepository clauseRepository;
    private final ContractRepository contractRepository;
    private final ClicksignService clicksignService;

    public ContractService(ClauseRepository clauseRepository,
                           ContractRepository contractRepository,
                           ClicksignService clicksignService) {
        this.clauseRepository = clauseRepository;
        this.contractRepository = contractRepository;
        this.clicksignService = clicksignService;
    }

    public List<Clause> findAllClauses() {
        return clauseRepository.findAll();
    }

    public Clause createClause(ClauseDTO clauseDTO) {
        Clause clause = new Clause();
        clause.setTitle(clauseDTO.getTitle());
        clause.setContent(clauseDTO.getContent());
        return clauseRepository.save(clause);
    }

    public Clause updateClause(Long id, ClauseDTO clauseDTO) {
        Clause clause = clauseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Cláusula não encontrada com id: " + id));

        clause.setTitle(clauseDTO.getTitle());
        clause.setContent(clauseDTO.getContent());

        return clauseRepository.save(clause);
    }

    public void deleteClause(Long id) {
        if (!clauseRepository.existsById(id)) {
            throw new EntityNotFoundException("Cláusula não encontrada com id: " + id);
        }
        clauseRepository.deleteById(id);
    }

    @Transactional
    public Contract createContractForSigning(CreateContractRequest request) throws IOException {

        // 1. Gera o PDF binário (usa a lista de cláusulas do request)
        byte[] pdfBytes = generateContractPDF(request.getClauses());

        Contract contract = new Contract();

        // SETA O TÍTULO RECEBIDO
        contract.setTitle(request.getTitle() != null && !request.getTitle().isEmpty()
                ? request.getTitle()
                : "Contrato Sem Título"); // Fallback caso venha vazio

        contract.setPdfData(pdfBytes);

        // 2. Salva localmente primeiro para gerar o UUID
        contract = contractRepository.save(contract);

        String safeFileName = contract.getTitle().replaceAll("[^a-zA-Z0-9.-]", "_") + "_" + contract.getUuid() + ".pdf";
        String clicksignDocKey = clicksignService.uploadDocument(pdfBytes, safeFileName);

        contract.setExternalKey(clicksignDocKey);

        return contractRepository.save(contract);
    }

    public Contract getContractByUuid(UUID uuid) {
        return contractRepository.findByUuid(uuid)
                .orElseThrow(() -> new EntityNotFoundException("Contrato não encontrado com UUID: " + uuid));
    }

    public List<Contract> findAllContracts() {
        return contractRepository.findAll();
    }

    @Transactional
    public Signature addSignerToContract(UUID uuid, SignatureDTO signatureDTO) {
        Contract contract = getContractByUuid(uuid);

        if (contract.getExternalKey() == null || contract.getExternalKey().isEmpty()) {
            throw new IllegalStateException("Este contrato não possui uma chave da Clicksign vinculada (externalKey).");
        }

        Signature newSignature = new Signature();
        newSignature.setSignerName(signatureDTO.getSignerName());
        newSignature.setEmail(signatureDTO.getEmail());
        newSignature.setCpf(signatureDTO.getCpf());
        newSignature.setRole(signatureDTO.getRole());
        newSignature.setContract(contract);

        try {
            String signerKey = clicksignService.createSigner(signatureDTO);

            clicksignService.addSignerToDocument(
                    contract.getExternalKey(), // Key do Documento
                    signerKey,                 // Key do Signatário
                    signatureDTO.getRole()
            );

            // Opcional: Salvar a key do signatário se tiver campo na entidade Signature
            // newSignature.setExternalKey(signerKey);

        } catch (Exception e) {
            throw new RuntimeException("Erro ao processar assinatura na Clicksign: " + e.getMessage(), e);
        }

        contract.getSignatures().add(newSignature);
        contractRepository.save(contract);

        return newSignature;
    }

    public byte[] generateContractPDF(List<ClauseDTO> clauses) throws IOException {
        try (PDDocument document = new PDDocument()) {

            PDImageXObject bgStandard = loadImage(document, "images/papel_timbrado.jpg");

            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);
            drawBackground(document, page, bgStandard);

            PDPageContentStream content = new PDPageContentStream(document, page, PDPageContentStream.AppendMode.APPEND, true, true);

            float margin = 50;
            float pageHeight = page.getMediaBox().getHeight();
            float pageWidth = page.getMediaBox().getWidth();
            float yStart = pageHeight - 100;
            float yPosition = yStart;
            float footerHeight = 50;
            float lineSpacing = 16;

            // Título
            content.beginText();
            content.setFont(PDType1Font.TIMES_BOLD, 18);
            content.newLineAtOffset(margin, yPosition);
            content.showText("CONTRATO DE PRESTAÇÃO DE SERVIÇOS");
            content.endText();
            yPosition -= 40;

            for (ClauseDTO clause : clauses) {
                content.beginText();
                content.setFont(PDType1Font.TIMES_BOLD, 14);
                content.newLineAtOffset(margin, yPosition);
                content.showText(clause.getTitle());
                content.endText();
                yPosition -= 20;

                content.setFont(PDType1Font.TIMES_ROMAN, 12);
                String[] words = clause.getContent().split(" ");
                StringBuilder line = new StringBuilder();
                float maxWidth = pageWidth - 2 * margin;

                for (String word : words) {
                    String temp = line + word + " ";
                    float textWidth = PDType1Font.TIMES_ROMAN.getStringWidth(temp) / 1000 * 12;

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

                    // Verifica quebra de página
                    if (yPosition < footerHeight + 40) {
                        content.close(); // Fecha o stream da página atual

                        page = new PDPage(PDRectangle.A4);
                        document.addPage(page);
                        drawBackground(document, page, bgStandard);

                        // Abre novo stream para a nova página
                        content = new PDPageContentStream(document, page, PDPageContentStream.AppendMode.APPEND, true, true);
                        content.setFont(PDType1Font.TIMES_ROMAN, 12);
                        yPosition = yStart;
                    }
                }

                // Imprime o restante da linha final da cláusula
                if (!line.isEmpty()) {
                    content.beginText();
                    content.newLineAtOffset(margin, yPosition);
                    content.showText(line.toString().trim());
                    content.endText();
                    yPosition -= lineSpacing * 2;
                }
            }
            content.close();
            int totalPages = document.getNumberOfPages();
            for (int i = 0; i < totalPages; i++) {
                PDPage currentPage = document.getPage(i);

                try (PDPageContentStream pageNumberStream = new PDPageContentStream(document, currentPage, PDPageContentStream.AppendMode.APPEND, true, true)) {

                    String pageText = String.format("Página %d de %d", i + 1, totalPages);
                    float fontSize = 10;
                    PDType1Font font = PDType1Font.TIMES_ROMAN;

                    float textWidth = font.getStringWidth(pageText) / 1000 * fontSize;

                    float xOffset = currentPage.getMediaBox().getWidth() - margin - textWidth;

                    float yOffset = 30;

                    pageNumberStream.beginText();
                    pageNumberStream.setFont(font, fontSize);
                    pageNumberStream.newLineAtOffset(xOffset, yOffset);
                    pageNumberStream.showText(pageText);
                    pageNumberStream.endText();
                }
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            return baos.toByteArray();
        }
    }

    private void drawBackground(PDDocument doc, PDPage page, PDImageXObject image) throws IOException {
        if (image == null) return;
        try (PDPageContentStream bgStream = new PDPageContentStream(doc, page, PDPageContentStream.AppendMode.PREPEND, true, true)) {
            bgStream.drawImage(image, 0, 0, page.getMediaBox().getWidth(), page.getMediaBox().getHeight());
        }
    }

    private PDImageXObject loadImage(PDDocument doc, String path) {
        try {
            ClassPathResource resource = new ClassPathResource(path);
            InputStream inputStream = resource.getInputStream();
            return PDImageXObject.createFromByteArray(doc, inputStream.readAllBytes(), path);
        } catch (IOException e) {
            return null;
        }
    }
}