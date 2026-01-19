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
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ContractService {

    private final ClauseRepository clauseRepository;
    private final ContractRepository contractRepository;
    private final ClicksignService clicksignService;

    // Definição das fontes
    private static final PDFont FONT_NORMAL = PDType1Font.TIMES_ROMAN;
    private static final PDFont FONT_BOLD = PDType1Font.TIMES_BOLD;
    private static final float FONT_SIZE = 12;

    public ContractService(ClauseRepository clauseRepository,
                           ContractRepository contractRepository,
                           ClicksignService clicksignService) {
        this.clauseRepository = clauseRepository;
        this.contractRepository = contractRepository;
        this.clicksignService = clicksignService;
    }

    public List<Clause> findAllClauses() { return clauseRepository.findAll(); }
    public Clause createClause(ClauseDTO clauseDTO) { Clause c = new Clause(); c.setTitle(clauseDTO.getTitle()); c.setContent(clauseDTO.getContent()); return clauseRepository.save(c); }
    public Clause updateClause(Long id, ClauseDTO clauseDTO) { Clause c = clauseRepository.findById(id).orElseThrow(); c.setTitle(clauseDTO.getTitle()); c.setContent(clauseDTO.getContent()); return clauseRepository.save(c); }
    public void deleteClause(Long id) { clauseRepository.deleteById(id); }
    public Contract getContractByUuid(UUID uuid) { return contractRepository.findByUuid(uuid).orElseThrow(); }
    public List<Contract> findAllContracts() { return contractRepository.findAll(); }

    public Contract updateContract(UUID uuid, String newTitle) {
        Contract contract = getContractByUuid(uuid);
        contract.setTitle(newTitle);
        return contractRepository.save(contract);
    }

    @Transactional
    public void deleteContract(UUID uuid) {
        Contract contract = getContractByUuid(uuid);
        contractRepository.delete(contract);
    }

    @Transactional
    public Contract createContractForSigning(CreateContractRequest request) throws IOException {
        // CORREÇÃO 1: Passa o título do request para o gerador de PDF
        byte[] pdfBytes = generateContractPDF(request.getTitle(), request.getClauses());

        Contract contract = new Contract();
        contract.setTitle(request.getTitle() != null && !request.getTitle().isEmpty() ? request.getTitle() : "Contrato Sem Título");
        contract.setPdfData(pdfBytes);
        contract = contractRepository.save(contract);

        String safeFileName = contract.getTitle().replaceAll("[^a-zA-Z0-9.-]", "_") + "_" + contract.getUuid() + ".pdf";
        String clicksignDocKey = clicksignService.uploadDocument(pdfBytes, safeFileName);
        contract.setExternalKey(clicksignDocKey);

        return contractRepository.save(contract);
    }

    @Transactional
    public Signature addSignerToContract(UUID uuid, SignatureDTO signatureDTO) {
        Contract contract = getContractByUuid(uuid);
        if (contract.getExternalKey() == null) throw new IllegalStateException("Sem externalKey");
        Signature newSignature = new Signature();
        newSignature.setSignerName(signatureDTO.getSignerName());
        newSignature.setEmail(signatureDTO.getEmail());
        newSignature.setCpf(signatureDTO.getCpf());
        newSignature.setRole(signatureDTO.getRole());
        newSignature.setContract(contract);
        try {
            String signerKey = clicksignService.createSigner(signatureDTO);
            clicksignService.addSignerToDocument(contract.getExternalKey(), signerKey, signatureDTO.getRole());
        } catch (Exception e) { throw new RuntimeException(e); }
        contract.getSignatures().add(newSignature);
        contractRepository.save(contract);
        return newSignature;
    }

    // --- LÓGICA DE GERAÇÃO DE PDF ---

    // CORREÇÃO 1: Assinatura do método alterada para receber o título
    public byte[] generateContractPDF(String contractTitle, List<ClauseDTO> clauses) throws IOException {
        try (PDDocument document = new PDDocument()) {

            PDImageXObject bgStandard = loadImage(document, "images/papel_timbrado.png");

            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);
            drawBackground(document, page, bgStandard);

            PDPageContentStream content = new PDPageContentStream(document, page, PDPageContentStream.AppendMode.APPEND, true, true);

            float margin = 50;
            float pageWidth = page.getMediaBox().getWidth();
            float pageHeight = page.getMediaBox().getHeight();
            float effectiveWidth = pageWidth - 2 * margin;

            // CORREÇÃO 2: Aumentado de 50 para 120 para não cobrir o rodapé do papel timbrado
            float footerHeight = 120;

            float yStart = pageHeight - 100;
            float yPosition = yStart;
            float lineSpacing = 18;

            // Título do Contrato (Dinâmico)
            content.beginText();
            content.setFont(FONT_BOLD, 18);

            // Usa o título recebido ou um fallback
            String titleText = (contractTitle != null && !contractTitle.trim().isEmpty())
                    ? contractTitle.toUpperCase()
                    : "CONTRATO DE PRESTAÇÃO DE SERVIÇOS";

            float titleWidth = FONT_BOLD.getStringWidth(titleText) / 1000 * 18;
            content.newLineAtOffset((pageWidth - titleWidth) / 2, yPosition);
            content.showText(titleText);
            content.endText();
            yPosition -= 40;

            for (ClauseDTO clause : clauses) {
                // Título da Cláusula
                content.beginText();
                content.setFont(FONT_BOLD, 14);
                content.newLineAtOffset(margin, yPosition);
                content.showText(clause.getTitle());
                content.endText();
                yPosition -= 20;

                // Processamento do Conteúdo
                String rawContent = clause.getContent() != null ? clause.getContent() : "";
                String safeContent = rawContent.replaceAll("[\\n\\r\\t]", " ");

                List<Word> words = parseContentToWords(safeContent);
                List<Word> currentLine = new ArrayList<>();
                float currentLineWidth = 0;

                for (Word word : words) {
                    float wordWidth = word.getWidth();
                    float spaceWidth = (word.isBold ? FONT_BOLD : FONT_NORMAL).getStringWidth(" ") / 1000 * FONT_SIZE;

                    if (currentLineWidth + wordWidth > effectiveWidth) {
                        printLine(content, currentLine, margin, yPosition, effectiveWidth, true);

                        currentLine.clear();
                        currentLineWidth = 0;
                        yPosition -= lineSpacing;

                        // Verifica quebra de página respeitando o footerHeight maior
                        if (yPosition < footerHeight) {
                            content.close();
                            page = new PDPage(PDRectangle.A4);
                            document.addPage(page);
                            drawBackground(document, page, bgStandard);
                            content = new PDPageContentStream(document, page, PDPageContentStream.AppendMode.APPEND, true, true);
                            yPosition = yStart;
                        }
                    }

                    currentLine.add(word);
                    currentLineWidth += wordWidth + spaceWidth;
                }

                if (!currentLine.isEmpty()) {
                    printLine(content, currentLine, margin, yPosition, effectiveWidth, false);
                    yPosition -= lineSpacing * 2;
                }
            }
            content.close();

            addPageNumbers(document, margin, footerHeight);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            return baos.toByteArray();
        }
    }

    private void printLine(PDPageContentStream content, List<Word> words, float x, float y, float maxWidth, boolean justify) throws IOException {
        if (words.isEmpty()) return;

        content.beginText();
        content.newLineAtOffset(x, y);

        float totalWordWidth = 0;
        for (Word w : words) totalWordWidth += w.getWidth();

        float extraSpace = 0;
        if (justify && words.size() > 1) {
            float totalStandardSpacesWidth = 0;
            for (int i = 0; i < words.size() - 1; i++) {
                PDFont font = words.get(i).isBold ? FONT_BOLD : FONT_NORMAL;
                totalStandardSpacesWidth += font.getStringWidth(" ") / 1000 * FONT_SIZE;
            }
            float availableSpace = maxWidth - totalWordWidth - totalStandardSpacesWidth;
            extraSpace = availableSpace / (words.size() - 1);
        }

        if (justify) {
            content.setWordSpacing(extraSpace);
        } else {
            content.setWordSpacing(0);
        }

        for (int i = 0; i < words.size(); i++) {
            Word w = words.get(i);
            content.setFont(w.isBold ? FONT_BOLD : FONT_NORMAL, FONT_SIZE);
            content.showText(w.text);
            if (i < words.size() - 1) {
                content.showText(" ");
            }
        }
        content.endText();
    }

    private List<Word> parseContentToWords(String text) throws IOException {
        List<Word> words = new ArrayList<>();
        Pattern pattern = Pattern.compile("\\*([^*]+)\\*|([^*\\s]+)");
        Matcher matcher = pattern.matcher(text);

        while (matcher.find()) {
            if (matcher.group(1) != null) {
                String boldSection = matcher.group(1);
                for (String subWord : boldSection.split("\\s+")) {
                    if (!subWord.isEmpty()) words.add(new Word(subWord, true));
                }
            } else {
                words.add(new Word(matcher.group(0), false));
            }
        }
        return words;
    }

    // CORREÇÃO 2: Ajuste da posição do número da página para respeitar o novo footerHeight
    private void addPageNumbers(PDDocument document, float margin, float footerHeight) throws IOException {
        int totalPages = document.getNumberOfPages();
        for (int i = 0; i < totalPages; i++) {
            PDPage currentPage = document.getPage(i);
            try (PDPageContentStream stream = new PDPageContentStream(document, currentPage, PDPageContentStream.AppendMode.APPEND, true, true)) {
                String pageText = String.format("Página %d de %d", i + 1, totalPages);
                stream.beginText();
                stream.setFont(FONT_NORMAL, 10);
                float textWidth = FONT_NORMAL.getStringWidth(pageText) / 1000 * 10;
                // Posiciona o número da página um pouco acima do rodapé protegido (ex: footerHeight - 20) ou numa posição fixa segura
                float safeY = footerHeight - 50; // Se o footerHeight é 120 (muito alto), o número fica em 70
                if (safeY < 30) safeY = 30; // Garante um mínimo

                stream.newLineAtOffset(currentPage.getMediaBox().getWidth() - margin - textWidth, safeY);
                stream.showText(pageText);
                stream.endText();
            }
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

    private static class Word {
        String text;
        boolean isBold;
        float width;

        Word(String text, boolean isBold) throws IOException {
            this.text = text;
            this.isBold = isBold;
            PDFont font = isBold ? FONT_BOLD : FONT_NORMAL;
            this.width = font.getStringWidth(text) / 1000 * FONT_SIZE;
        }

        float getWidth() { return width; }
    }
}