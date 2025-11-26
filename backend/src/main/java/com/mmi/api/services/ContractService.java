package com.mmi.api.services;

import com.mmi.infra.ClauseRepository;
import com.mmi.infra.ContractRepository;
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

    /**
     * 1. Gera o PDF
     * 2. Salva no Banco (para ter UUID)
     * 3. Faz Upload para Clicksign
     * 4. Salva a 'key' da Clicksign no contrato
     */
    @Transactional
    public Contract createContractForSigning(List<ClauseDTO> clauses) throws IOException {
        // 1. Gera o PDF binário
        byte[] pdfBytes = generateContractPDF(clauses);

        Contract contract = new Contract();
        contract.setPdfData(pdfBytes);

        // 2. Salva localmente primeiro para gerar o UUID
        contract = contractRepository.save(contract);

        // 3. Upload para Clicksign e recuperação da Key do documento
        String fileName = "Contrato_" + contract.getUuid() + ".pdf";
        String clicksignDocKey = clicksignService.uploadDocument(pdfBytes, fileName);

        // 4. Salva a chave externa para referência futura
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

    /**
     * 1. Cria o registro local da assinatura
     * 2. Cria o Signatário na Clicksign (API)
     * 3. Vincula o Signatário ao Documento na Clicksign (Dispara o e-mail)
     */
    @Transactional
    public Signature addSignerToContract(UUID uuid, SignatureDTO signatureDTO) {
        Contract contract = getContractByUuid(uuid);

        if (contract.getExternalKey() == null || contract.getExternalKey().isEmpty()) {
            throw new IllegalStateException("Este contrato não possui uma chave da Clicksign vinculada (externalKey).");
        }

        // Cria registro local
        Signature newSignature = new Signature();
        newSignature.setSignerName(signatureDTO.getSignerName());
        newSignature.setEmail(signatureDTO.getEmail());
        newSignature.setCpf(signatureDTO.getCpf());
        newSignature.setRole(signatureDTO.getRole());
        newSignature.setContract(contract);

        try {
            // A. Cria (ou recupera) o signatário na Clicksign
            String signerKey = clicksignService.createSigner(signatureDTO);

            // B. Vincula o signatário ao documento específico
            // Isso é o que faz o e-mail chegar para a pessoa
            clicksignService.addSignerToDocument(
                    contract.getExternalKey(), // Key do Documento
                    signerKey,                 // Key do Signatário
                    signatureDTO.getRole()     // Papel (Locatário, Locador, etc)
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

    // =============================================================================================
    // GERAÇÃO DO PDF (Mantida lógica visual, sem assinaturas desenhadas manualmente)
    // =============================================================================================
    public byte[] generateContractPDF(List<ClauseDTO> clauses) throws IOException {
        try (PDDocument document = new PDDocument()) {

            // Tenta carregar imagem de fundo (Papel Timbrado)
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
                // Título da Cláusula
                content.beginText();
                content.setFont(PDType1Font.TIMES_BOLD, 14);
                content.newLineAtOffset(margin, yPosition);
                content.showText(clause.getTitle());
                content.endText();
                yPosition -= 20;

                // Conteúdo da Cláusula (com quebra de linha)
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
                        content.close();
                        page = new PDPage(PDRectangle.A4);
                        document.addPage(page);
                        drawBackground(document, page, bgStandard);
                        content = new PDPageContentStream(document, page, PDPageContentStream.AppendMode.APPEND, true, true);
                        content.setFont(PDType1Font.TIMES_ROMAN, 12);
                        yPosition = yStart;
                    }
                }

                // Imprime o restante da linha
                if (!line.isEmpty()) {
                    content.beginText();
                    content.newLineAtOffset(margin, yPosition);
                    content.showText(line.toString().trim());
                    content.endText();
                    yPosition -= lineSpacing * 2;
                }
            }
            content.close();

            // A Clicksign adiciona automaticamente a página de assinaturas/log ao final.

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
            // Logar erro se necessário, ou retornar null para seguir sem imagem
            return null;
        }
    }
}