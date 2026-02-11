package com.mmi.api.services;

import com.mmi.infra.ClauseRepository;
import com.mmi.infra.ContractRepository;
import com.mmi.models.Clause;
import com.mmi.models.Contract;
import com.mmi.models.Signature;
import com.mmi.models.dto.ClauseDTO;
import com.mmi.models.dto.CreateContractRequest;
import com.mmi.models.dto.SignatureDTO;
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
import org.springframework.web.multipart.MultipartFile;

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
    private final CloudinaryService cloudinaryService;

    // Definição das fontes
    private static final PDFont FONT_NORMAL = PDType1Font.TIMES_ROMAN;
    private static final PDFont FONT_BOLD = PDType1Font.TIMES_BOLD;
    private static final float FONT_SIZE = 12;

    public ContractService(ClauseRepository clauseRepository,
                           ContractRepository contractRepository,
                           ClicksignService clicksignService,
                           CloudinaryService cloudinaryService) {
        this.clauseRepository = clauseRepository;
        this.contractRepository = contractRepository;
        this.clicksignService = clicksignService;
        this.cloudinaryService = cloudinaryService;
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

    // Mantido para compatibilidade, se necessário
    @Transactional
    public Contract createContractForSigning(CreateContractRequest request) throws IOException {
        return createContractWithImages(request, null);
    }

    // --- NOVO MÉTODO PRINCIPAL DE CRIAÇÃO COM IMAGENS ---
    @Transactional
    public Contract createContractWithImages(CreateContractRequest request, List<MultipartFile> files) throws IOException {
        Contract contract = new Contract();
        contract.setTitle(request.getTitle() != null && !request.getTitle().isEmpty() ? request.getTitle() : "Contrato Sem Título");

        // 1. Upload das imagens para o Cloudinary (se houver) e salvar URLs
        if (files != null && !files.isEmpty()) {
            List<String> uploadedUrls = new ArrayList<>();
            // Define uma pasta única para o contrato
            String folder = "mmi/contracts/" + contract.getUuid();

            for (MultipartFile file : files) {
                String url = cloudinaryService.uploadFile(file, folder);
                uploadedUrls.add(url);
            }
            contract.setImageUrls(uploadedUrls);
        }

        // 2. Gerar PDF (incluindo as imagens anexadas no final)
        byte[] pdfBytes = generateContractPDF(request.getTitle(), request.getClauses(), files);
        contract.setPdfData(pdfBytes);

        contract = contractRepository.save(contract);

        // 3. Enviar para Clicksign
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

    // --- LÓGICA DE GERAÇÃO DE PDF OTIMIZADA ---

    // Sobrecarga para manter compatibilidade interna
    public byte[] generateContractPDF(String contractTitle, List<ClauseDTO> clauses) throws IOException {
        return generateContractPDF(contractTitle, clauses, null);
    }

    public byte[] generateContractPDF(String contractTitle, List<ClauseDTO> clauses, List<MultipartFile> attachedImages) throws IOException {
        try (PDDocument document = new PDDocument()) {

            PDImageXObject bgStandard = loadImage(document, "images/papel_timbrado.jpg");

            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);
            drawBackground(document, page, bgStandard);

            PDPageContentStream content = new PDPageContentStream(document, page, PDPageContentStream.AppendMode.APPEND, true, true);

            float margin = 50;
            float pageWidth = page.getMediaBox().getWidth();
            float pageHeight = page.getMediaBox().getHeight();
            float effectiveWidth = pageWidth - 2 * margin;

            // Rodapé protegido para não cobrir informações do papel timbrado
            float footerHeight = 120;

            float yStart = pageHeight - 100;
            float yPosition = yStart;
            float lineSpacing = 18;

            // 1. Título do Contrato
            content.beginText();
            content.setFont(FONT_BOLD, 18);
            String titleText = (contractTitle != null && !contractTitle.trim().isEmpty())
                    ? contractTitle.toUpperCase()
                    : "CONTRATO DE PRESTAÇÃO DE SERVIÇOS";

            float titleWidth = FONT_BOLD.getStringWidth(titleText) / 1000 * 18;
            content.newLineAtOffset((pageWidth - titleWidth) / 2, yPosition);
            content.showText(titleText);
            content.endText();
            yPosition -= 40;

            for (ClauseDTO clause : clauses) {
                // 2. Título da Cláusula
                content.beginText();
                content.setFont(FONT_BOLD, 14);
                content.newLineAtOffset(margin, yPosition);
                content.showText(clause.getTitle());
                content.endText();
                yPosition -= 20;

                // 3. Processamento do Conteúdo (PARÁGRAFO POR PARÁGRAFO)
                String rawContent = clause.getContent() != null ? clause.getContent() : "";

                // Divide por quebras de linha explicitamente para respeitar parágrafos
                String[] paragraphs = rawContent.split("\\r?\\n");

                for (String paragraph : paragraphs) {
                    // Se o parágrafo for vazio (Enter duplo), apenas pula linha
                    if (paragraph.trim().isEmpty()) {
                        yPosition -= lineSpacing;
                        // Verifica quebra de página se necessário
                        if (yPosition < footerHeight) {
                            content.close();
                            page = new PDPage(PDRectangle.A4);
                            document.addPage(page);
                            drawBackground(document, page, bgStandard);
                            content = new PDPageContentStream(document, page, PDPageContentStream.AppendMode.APPEND, true, true);
                            yPosition = yStart;
                        }
                        continue;
                    }

                    // Remove caracteres inválidos APENAS dentro do parágrafo (mantém o fluxo)
                    String safeParagraph = paragraph.replaceAll("[\\t\\x0B\\f\\r]", " ");

                    List<Word> words = parseContentToWords(safeParagraph);
                    List<Word> currentLine = new ArrayList<>();
                    float currentLineWidth = 0;

                    for (Word word : words) {
                        float wordWidth = word.getWidth();
                        float spaceWidth = (word.isBold ? FONT_BOLD : FONT_NORMAL).getStringWidth(" ") / 1000 * FONT_SIZE;

                        if (currentLineWidth + wordWidth > effectiveWidth) {
                            // Linha cheia -> Imprime JUSTIFICADO
                            printLine(content, currentLine, margin, yPosition, effectiveWidth, true);

                            currentLine.clear();
                            currentLineWidth = 0;
                            yPosition -= lineSpacing;

                            // Verifica quebra de página
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

                    // Fim do Parágrafo: A última linha deve ser ALINHADA À ESQUERDA (false)
                    if (!currentLine.isEmpty()) {
                        printLine(content, currentLine, margin, yPosition, effectiveWidth, false);
                        yPosition -= lineSpacing;
                    }

                    // Verifica quebra de página após parágrafo
                    if (yPosition < footerHeight) {
                        content.close();
                        page = new PDPage(PDRectangle.A4);
                        document.addPage(page);
                        drawBackground(document, page, bgStandard);
                        content = new PDPageContentStream(document, page, PDPageContentStream.AppendMode.APPEND, true, true);
                        yPosition = yStart;
                    }
                }

                // Espaço extra entre cláusulas diferentes
                yPosition -= lineSpacing;
            }
            content.close(); // Fecha o stream de texto das cláusulas

            // --- 4. ANEXAR IMAGENS COMPACTAS (2 por página) ---
            if (attachedImages != null && !attachedImages.isEmpty()) {
                PDPage imgPage = null;
                PDPageContentStream imgContent = null;

                // Dimensões úteis para layout
                float safeTop = pageHeight - 100;
                float safeBottom = 100;
                float availableHeightTotal = safeTop - safeBottom;
                float gap = 20; // Espaço entre as duas fotos
                float maxSlotHeight = (availableHeightTotal - gap) / 2;

                for (int i = 0; i < attachedImages.size(); i++) {
                    MultipartFile imgFile = attachedImages.get(i);
                    try {
                        PDImageXObject pdImage = PDImageXObject.createFromByteArray(document, imgFile.getBytes(), imgFile.getOriginalFilename());

                        // Se o índice for par (0, 2, 4...), cria uma nova página e abre o stream
                        if (i % 2 == 0) {
                            if (imgContent != null) imgContent.close();

                            imgPage = new PDPage(PDRectangle.A4);
                            document.addPage(imgPage);

                            // Mantém o papel timbrado de fundo
                            drawBackground(document, imgPage, bgStandard);

                            imgContent = new PDPageContentStream(document, imgPage, PDPageContentStream.AppendMode.APPEND, true, true);
                        }

                        // Define se é o slot superior ou inferior
                        boolean isTopSlot = (i % 2 == 0);

                        // Lógica de Redimensionamento (Contain)
                        float imgW = pdImage.getWidth();
                        float imgH = pdImage.getHeight();
                        float scale = 1.0f;

                        // 1. Ajusta pela largura
                        if (imgW > effectiveWidth) {
                            scale = effectiveWidth / imgW;
                        }
                        // 2. Ajusta pela altura (limitada à metade da página)
                        float scaledH = imgH * scale;
                        if (scaledH > maxSlotHeight) {
                            scale = scale * (maxSlotHeight / scaledH);
                        }

                        float drawW = imgW * scale;
                        float drawH = imgH * scale;

                        // Centralizar horizontalmente
                        float drawX = margin + (effectiveWidth - drawW) / 2;

                        // Calcular Y (Centralizar verticalmente no slot respectivo)
                        float drawY;
                        if (isTopSlot) {
                            // Centro do slot superior
                            float slotCenterY = safeTop - (maxSlotHeight / 2);
                            drawY = slotCenterY - (drawH / 2);
                        } else {
                            // Centro do slot inferior
                            float slotCenterY = safeBottom + (maxSlotHeight / 2);
                            drawY = slotCenterY - (drawH / 2);
                        }

                        if (imgContent != null) {
                            imgContent.drawImage(pdImage, drawX, drawY, drawW, drawH);
                        }

                    } catch (Exception e) {
                        System.err.println("Erro ao anexar imagem ao PDF: " + e.getMessage());
                        // Continua para a próxima imagem mesmo se uma falhar
                    }
                }
                // Fecha o último content stream aberto
                if (imgContent != null) imgContent.close();
            }

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
        // Só justifica se tiver mais de uma palavra e a flag estiver true
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

    private void addPageNumbers(PDDocument document, float margin, float footerHeight) throws IOException {
        int totalPages = document.getNumberOfPages();
        for (int i = 0; i < totalPages; i++) {
            PDPage currentPage = document.getPage(i);
            try (PDPageContentStream stream = new PDPageContentStream(document, currentPage, PDPageContentStream.AppendMode.APPEND, true, true)) {
                String pageText = String.format("Página %d de %d", i + 1, totalPages);
                stream.beginText();
                stream.setFont(FONT_NORMAL, 10);
                float textWidth = FONT_NORMAL.getStringWidth(pageText) / 1000 * 10;

                float safeY = footerHeight - 50;
                if (safeY < 30) safeY = 30;

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