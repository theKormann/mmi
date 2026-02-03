package com.mmi.api.services;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

@Service
public class WatermarkService {

    // Agora recebemos o OutputStream para onde a imagem final será enviada
    public void addWatermark(MultipartFile originalFile, OutputStream outputStream, float opacity) throws IOException {

        // OTIMIZAÇÃO 1: Usar getInputStream() direto, sem carregar getBytes() na memória
        try (InputStream fileStream = originalFile.getInputStream();
             InputStream watermarkStream = new ClassPathResource("mmi-watermark.png").getInputStream()) {

            BufferedImage mainImage = ImageIO.read(fileStream);

            // Verificação de segurança caso o arquivo não seja uma imagem válida
            if (mainImage == null) {
                throw new IOException("O arquivo enviado não é uma imagem válida ou suportada.");
            }

            BufferedImage watermarkImage = ImageIO.read(watermarkStream);

            Graphics2D g = (Graphics2D) mainImage.getGraphics();
            g.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, opacity));

            int mainWidth = mainImage.getWidth();
            int mainHeight = mainImage.getHeight();
            int waterWidth = watermarkImage.getWidth();
            int waterHeight = watermarkImage.getHeight();

            // Centralizar
            int x = (mainWidth - waterWidth) / 2;
            int y = (mainHeight - waterHeight) / 2;

            g.drawImage(watermarkImage, x, y, null);
            g.dispose();

            // OTIMIZAÇÃO 2: Escrever direto na saída (response), sem criar array de bytes intermediário
            ImageIO.write(mainImage, "png", outputStream);

            // OTIMIZAÇÃO 3: Ajudar o Garbage Collector liberando a imagem pesada
            mainImage.flush();
        }
    }
}