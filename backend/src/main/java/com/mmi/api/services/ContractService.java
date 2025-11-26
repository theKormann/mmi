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
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ContractService {

    private final ClauseRepository clauseRepository;
    private final ContractRepository contractRepository;

    public ContractService(ClauseRepository clauseRepository, ContractRepository contractRepository) {
        this.clauseRepository = clauseRepository;
        this.contractRepository = contractRepository;
    }

    // ✅ Cria o contrato inicial (sem assinaturas visuais ainda)
    public Contract createContractForSigning(List<ClauseDTO> clauses) throws IOException {
        byte[] pdfBytes = generateContractPDF(clauses, new ArrayList<>());
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

    // ✅ Adiciona assinatura e REGERA o PDF com os desenhos
    public Signature addSignatureToContract(UUID uuid, SignatureDTO signatureDTO) {
        Contract contract = getContractByUuid(uuid);

        Signature newSignature = new Signature();
        newSignature.setSignatureImage(signatureDTO.getSignatureImage());
        newSignature.setSignerName(signatureDTO.getSignerName());
        newSignature.setRole(signatureDTO.getRole()); // Salva o Cargo
        newSignature.setContract(contract);

        contract.getSignatures().add(newSignature);

        // --- LÓGICA DE REGERAÇÃO DO PDF ---
        try {
            // Busca todas as cláusulas para reconstruir o texto
            // (Assumindo que o contrato usa todas as cláusulas ativas no sistema)
            List<ClauseDTO> allClauses = clauseRepository.findAll().stream()
                    .map(c -> new ClauseDTO(c.getTitle(), c.getContent()))
                    .collect(Collectors.toList());

            // Regera o PDF passando as cláusulas E a lista atualizada de assinaturas
            byte[] updatedPdf = generateContractPDF(allClauses, contract.getSignatures());
            contract.setPdfData(updatedPdf);

        } catch (IOException e) {
            throw new RuntimeException("Erro ao processar PDF com novas assinaturas", e);
        }
        // ----------------------------------

        contractRepository.save(contract);
        return newSignature;
    }

    // ✅ Método Principal de Geração de PDF (Texto + Assinaturas)
    public byte[] generateContractPDF(List<ClauseDTO> clauses, List<Signature> signatures) throws IOException {
        try (PDDocument document = new PDDocument()) {

            PDImageXObject bgStandard = loadImage(document, "images/papel_timbrado.jpg");
            PDImageXObject bgSignature = loadImage(document, "images/assinatura_timbrado.jpg");

            // =================================================================================
            // PARTE 1: CONTEÚDO DO TEXTO (CLÁUSULAS)
            // =================================================================================
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

            content.beginText();
            content.setFont(PDType1Font.TIMES_BOLD, 18);
            content.newLineAtOffset(margin, yPosition);
            content.showText("CONTRATO DE PRESTAÇÃO DE SERVIÇOS IMOBILIÁRIOS");
            content.endText();
            yPosition -= 40;

            for (ClauseDTO clause : clauses) {
                // Título
                content.beginText();
                content.setFont(PDType1Font.TIMES_BOLD, 14);
                content.newLineAtOffset(margin, yPosition);
                content.showText(clause.getTitle());
                content.endText();
                yPosition -= 20;

                // Conteúdo
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

                    if (yPosition < footerHeight + 40) {
                        content.close();
                        page = new PDPage(PDRectangle.A4);
                        document.addPage(page);
                        drawBackground(document, page, bgStandard);
                        content = new PDPageContentStream(document, page, PDPageContentStream.AppendMode.APPEND, true, true);
                        content.setFont(PDType1Font.TIMES_ROMAN, 12);
                        yPosition = yStart;
                    }
                }

                if (!line.isEmpty()) {
                    content.beginText();
                    content.newLineAtOffset(margin, yPosition);
                    content.showText(line.toString().trim());
                    content.endText();
                    yPosition -= lineSpacing * 2;
                }
            }
            content.close();

            // =================================================================================
            // PARTE 2: PÁGINA DE ASSINATURAS (COM DESENHOS)
            // =================================================================================
            PDPage signaturePage = new PDPage(PDRectangle.A4);
            document.addPage(signaturePage);
            drawBackground(document, signaturePage, bgSignature);

            try (PDPageContentStream sigStream = new PDPageContentStream(document, signaturePage, PDPageContentStream.AppendMode.APPEND, true, true)) {

                float sigY = pageHeight - 150;
                float sigXStart = margin;

                // Título da seção
                sigStream.beginText();
                sigStream.setFont(PDType1Font.TIMES_BOLD, 16);
                sigStream.newLineAtOffset(sigXStart, sigY + 40);
                sigStream.showText("Assinaturas");
                sigStream.endText();

                int colIndex = 0; // 0 = esquerda, 1 = direita

                for (Signature sig : signatures) {
                    // Processar imagem Base64 (remover prefixo se existir)
                    String base64Image = sig.getSignatureImage();
                    if (base64Image != null && base64Image.contains(",")) {
                        base64Image = base64Image.split(",")[1];
                    }

                    if (base64Image != null && !base64Image.isEmpty()) {
                        try {
                            byte[] imageBytes = Base64.getDecoder().decode(base64Image);
                            PDImageXObject pdImage = PDImageXObject.createFromByteArray(document, imageBytes, "sig_" + sig.getId());

                            // Define posição X baseada na coluna
                            float currentX = (colIndex % 2 == 0) ? sigXStart : sigXStart + 250;

                            // Desenha a imagem da assinatura
                            // Ajuste o tamanho (width: 150, height: 60) conforme necessário
                            sigStream.drawImage(pdImage, currentX, sigY, 150, 60);

                            // Desenha a linha abaixo da assinatura
                            sigStream.setLineWidth(1f);
                            sigStream.moveTo(currentX, sigY - 5);
                            sigStream.lineTo(currentX + 150, sigY - 5);
                            sigStream.stroke();

                            // Nome do assinante
                            sigStream.beginText();
                            sigStream.setFont(PDType1Font.TIMES_BOLD, 11);
                            sigStream.newLineAtOffset(currentX, sigY - 20);
                            String name = sig.getSignerName() != null ? sig.getSignerName() : "";
                            sigStream.showText(name);
                            sigStream.endText();

                            // Cargo / Role
                            sigStream.beginText();
                            sigStream.setFont(PDType1Font.TIMES_ROMAN, 10);
                            sigStream.newLineAtOffset(currentX, sigY - 35);
                            String role = sig.getRole() != null ? sig.getRole().toUpperCase() : "PARTICIPANTE";
                            sigStream.showText(role);
                            sigStream.endText();

                            colIndex++;
                            if (colIndex % 2 == 0) {
                                sigY -= 120;
                            }

                            if (sigY < 50) {
                                break;
                            }

                        } catch (IllegalArgumentException e) {
                            System.err.println("Erro ao decodificar assinatura: " + e.getMessage());
                        }
                    }
                }
            }

            int totalPages = document.getNumberOfPages();
            int pageCounter = 1;

            for (PDPage currentPage : document.getPages()) {
                PDPageContentStream footerStream = new PDPageContentStream(document, currentPage, PDPageContentStream.AppendMode.APPEND, true, true);

                String pageText = "Página " + pageCounter + " de " + totalPages;

                footerStream.beginText();
                footerStream.setFont(PDType1Font.TIMES_ROMAN, 10);

                float textWidth = PDType1Font.TIMES_ROMAN.getStringWidth(pageText) / 1000 * 10;
                float xFooter = pageWidth - margin - textWidth;
                float yFooter = 30;

                footerStream.newLineAtOffset(xFooter, yFooter);
                footerStream.showText(pageText);
                footerStream.endText();
                footerStream.close();

                pageCounter++;
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
            System.err.println("Imagem não encontrada: " + path + ". Usando página em branco.");
            return null;
        }
    }
}