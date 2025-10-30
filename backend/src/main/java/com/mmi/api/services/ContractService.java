package com.mmi.api.services;

import com.mmi.models.dto.ClauseDTO;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import javax.swing.text.Document;
import javax.swing.text.Element;
import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class ContractService {

    public byte[] generateContractPDF(List<ClauseDTO> clauses) throws Exception {
        Document document = new Document(PageSize.A4, 50, 50, 50, 50);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();

        PdfWriter.getInstance(document, baos);
        document.open();

        Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD);
        Paragraph header = new Paragraph("CONTRATO DE PRESTAÇÃO DE SERVIÇOS IMOBILIÁRIOS\n\n", titleFont);
        header.setAlignment(Element.ALIGN_CENTER);
        document.add(header);

        Font clauseTitleFont = new Font(Font.HELVETICA, 14, Font.BOLD);
        Font clauseTextFont = new Font(Font.HELVETICA, 12, Font.NORMAL);

        int clauseNumber = 1;
        for (ClauseDTO clause : clauses) {
            Paragraph clauseTitle = new Paragraph("Cláusula " + clauseNumber + " - " + clause.getTitle(), clauseTitleFont);
            clauseTitle.setSpacingBefore(10);
            clauseTitle.setSpacingAfter(5);
            document.add(clauseTitle);

            Paragraph clauseText = new Paragraph(clause.getContent(), clauseTextFont);
            clauseText.setAlignment(Element.ALIGN_JUSTIFIED);
            document.add(clauseText);

            clauseNumber++;
        }

        // Rodapé
        Paragraph footer = new Paragraph("\n\n______________________________\nAssinatura das partes", clauseTextFont);
        footer.setAlignment(Element.ALIGN_CENTER);
        footer.setSpacingBefore(30);
        document.add(footer);

        document.close();
        return baos.toByteArray();
    }
}
