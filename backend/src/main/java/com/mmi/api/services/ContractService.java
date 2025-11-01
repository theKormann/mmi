package com.mmi.api.services;

import com.mmi.infra.ClauseRepository;
import com.mmi.models.Clause;
import com.mmi.models.dto.ClauseDTO;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class ContractService {

    private final ClauseRepository clauseRepository;

    public ContractService(ClauseRepository clauseRepository) {
        this.clauseRepository = clauseRepository;
    }

    public List<Clause> findAllClauses() {
        return clauseRepository.findAll();
    }

    public Clause createClause(ClauseDTO clauseDTO) {
        Clause newClause = new Clause(clauseDTO.getTitle(), clauseDTO.getContent());
        return clauseRepository.save(newClause);
    }

    public Clause updateClause(Long id, ClauseDTO clauseDetails) {
        // Encontra a cláusula ou lança um erro
        Clause clause = clauseRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Cláusula não encontrada com id: " + id));

        // Atualiza os dados
        clause.setTitle(clauseDetails.getTitle());
        clause.setContent(clauseDetails.getContent());

        // Salva as alterações
        return clauseRepository.save(clause);
    }

    public void deleteClause(Long id) {
        if (!clauseRepository.existsById(id)) {
            throw new EntityNotFoundException("Cláusula não encontrada com id: " + id);
        }
        clauseRepository.deleteById(id);
    }

    public byte[] generateContractPDF(List<ClauseDTO> clauses) throws IOException {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);

            try (PDPageContentStream content = new PDPageContentStream(document, page)) {
                // ... (todo o seu código de geração de PDF continua aqui, sem alterações) ...
                float margin = 50;
                float yStart = page.getMediaBox().getHeight() - margin;
                float yPosition = yStart;
                float lineSpacing = 16;

                // Título principal
                content.beginText();
                content.setFont(PDType1Font.HELVETICA_BOLD, 18);
                content.newLineAtOffset(margin, yPosition);
                content.showText("CONTRATO DE PRESTAÇÃO DE SERVIÇOS IMOBILIÁRIOS");
                content.endText();

                yPosition -= 40;

                // Cláusulas
                int clauseNumber = 1;
                for (ClauseDTO clause : clauses) {
                    content.beginText();
                    content.setFont(PDType1Font.HELVETICA_BOLD, 14);
                    content.newLineAtOffset(margin, yPosition);
                    content.showText("Cláusula " + clauseNumber + " - " + clause.getTitle());
                    content.endText();
                    yPosition -= 20;

                    // ... (resto do seu código de PDF) ...
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
                    clauseNumber++;
                    if (yPosition < 100) {
                        content.close();
                        page = new PDPage();
                        document.addPage(page);
                        yPosition = yStart;
                        // Correção: você precisa reabrir o content stream para a nova página
                        // Esta parte estava com um bug no seu original, mas pode não ser o foco agora.
                        // Apenas para constar, o correto seria:
                        // content = new PDPageContentStream(document, page); 
                    }
                }

                // Rodapé (assinatura)
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