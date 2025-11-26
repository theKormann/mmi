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

    // ==================================================================================
    // ✅ LÓGICA DE GERAÇÃO DE PDF ATUALIZADA
    // ==================================================================================

    public byte[] generateContractPDF(List<ClauseDTO> clauses) throws IOException {
        try (PDDocument document = new PDDocument()) {

            // ✅ 1. Carregar as imagens de fundo (Modelos)
            // Certifique-se de que esses arquivos existem em src/main/resources/images/
            PDImageXObject bgStandard = loadImage(document, "images/papel_timbrado.jpg");
            PDImageXObject bgSignature = loadImage(document, "images/assinatura_timbrado.jpg");

            // Cria a primeira página com o fundo padrão
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);
            drawBackground(document, page, bgStandard);

            PDPageContentStream content = new PDPageContentStream(document, page, PDPageContentStream.AppendMode.APPEND, true, true);

            float margin = 50;
            // Ajustar altura baseado no A4
            float pageHeight = page.getMediaBox().getHeight();
            float pageWidth = page.getMediaBox().getWidth();
            float yStart = pageHeight - 100; // Margem superior maior por causa do cabeçalho da imagem
            float yPosition = yStart;
            float footerHeight = 50; // Espaço reservado para numeração
            float lineSpacing = 16;

            // ✅ 2. Fonte Times New Roman
            content.beginText();
            content.setFont(PDType1Font.TIMES_BOLD, 18);
            content.newLineAtOffset(margin, yPosition);
            content.showText("CONTRATO DE PRESTAÇÃO DE SERVIÇOS IMOBILIÁRIOS");
            content.endText();
            yPosition -= 40;

            // Loop das Cláusulas
            for (ClauseDTO clause : clauses) {
                // Título da Cláusula (Times Bold)
                content.beginText();
                content.setFont(PDType1Font.TIMES_BOLD, 14);
                content.newLineAtOffset(margin, yPosition);
                content.showText(clause.getTitle());
                content.endText();
                yPosition -= 20;

                // Conteúdo da Cláusula (Times Roman)
                content.setFont(PDType1Font.TIMES_ROMAN, 12);
                String[] words = clause.getContent().split(" ");
                StringBuilder line = new StringBuilder();
                float maxWidth = pageWidth - 2 * margin;

                for (String word : words) {
                    String temp = line + word + " ";
                    // Cálculo de largura ajustado para Times Roman
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

                    // Verifica se a página acabou (considerando margem inferior)
                    if (yPosition < footerHeight + 40) {
                        content.close();

                        // ✅ Cria nova página padrão com imagem de fundo
                        page = new PDPage(PDRectangle.A4);
                        document.addPage(page);
                        drawBackground(document, page, bgStandard);

                        content = new PDPageContentStream(document, page, PDPageContentStream.AppendMode.APPEND, true, true);
                        content.setFont(PDType1Font.TIMES_ROMAN, 12);
                        yPosition = yStart;
                    }
                }

                // Escreve o restante da linha
                if (!line.isEmpty()) {
                    content.beginText();
                    content.newLineAtOffset(margin, yPosition);
                    content.showText(line.toString().trim());
                    content.endText();
                    yPosition -= lineSpacing * 2;
                }
            }

            content.close();

            // ✅ 3. Página de Assinatura (Modelo Especial)
            PDPage signaturePage = new PDPage(PDRectangle.A4);
            document.addPage(signaturePage);
            // Desenha o fundo específico de assinatura
            drawBackground(document, signaturePage, bgSignature);

            // Caso queira adicionar texto dinâmico na página de assinatura, faça aqui.
            // Se o modelo já tem as linhas desenhadas, não precisamos desenhar nada.

            // ✅ 4. Numeração de Páginas (Passo final: iterar em todas as páginas)
            int totalPages = document.getNumberOfPages();
            int pageCounter = 1;

            for (PDPage currentPage : document.getPages()) {
                PDPageContentStream footerStream = new PDPageContentStream(document, currentPage, PDPageContentStream.AppendMode.APPEND, true, true);

                String pageText = "Página " + pageCounter + " de " + totalPages;

                footerStream.beginText();
                footerStream.setFont(PDType1Font.TIMES_ROMAN, 10);

                // Calcula posição para ficar na borda inferior direita
                float textWidth = PDType1Font.TIMES_ROMAN.getStringWidth(pageText) / 1000 * 10;
                float xFooter = pageWidth - margin - textWidth;
                float yFooter = 30; // 30px da borda inferior

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
            // Desenha a imagem cobrindo toda a página (A4)
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