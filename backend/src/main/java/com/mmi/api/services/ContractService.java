package com.mmi.api.services;

import com.mmi.models.dto.ClauseDTO;
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

    public byte[] generateContractPDF(List<ClauseDTO> clauses) throws IOException {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);

            try (PDPageContentStream content = new PDPageContentStream(document, page)) {
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

                yPosition -= 40; // espaço após o título

                // Cláusulas
                int clauseNumber = 1;
                for (ClauseDTO clause : clauses) {
                    // Título da cláusula
                    content.beginText();
                    content.setFont(PDType1Font.HELVETICA_BOLD, 14);
                    content.newLineAtOffset(margin, yPosition);
                    content.showText("Cláusula " + clauseNumber + " - " + clause.getTitle());
                    content.endText();

                    yPosition -= 20;

                    // Texto da cláusula (quebra manual de linhas simples)
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

                    // Última linha
                    if (!line.isEmpty()) {
                        content.beginText();
                        content.newLineAtOffset(margin, yPosition);
                        content.showText(line.toString().trim());
                        content.endText();
                        yPosition -= lineSpacing * 2;
                    }

                    clauseNumber++;

                    // Nova página se acabar o espaço
                    if (yPosition < 100) {
                        content.close();
                        page = new PDPage();
                        document.addPage(page);
                        yPosition = yStart;
                        content.close();
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
