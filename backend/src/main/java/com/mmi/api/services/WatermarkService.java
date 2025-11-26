package com.mmi.api.services;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;

@Service
public class WatermarkService {

    public byte[] addWatermark(MultipartFile originalFile, float opacity) throws IOException {

        InputStream fileStream = new ByteArrayInputStream(originalFile.getBytes());
        BufferedImage mainImage = ImageIO.read(fileStream);


        InputStream watermarkStream = new ClassPathResource("mmi-watermark.png").getInputStream();
        BufferedImage watermarkImage = ImageIO.read(watermarkStream);

        Graphics2D g = (Graphics2D) mainImage.getGraphics();

        g.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, opacity));

        int mainWidth = mainImage.getWidth();
        int mainHeight = mainImage.getHeight();
        int waterWidth = watermarkImage.getWidth();
        int waterHeight = watermarkImage.getHeight();

        int x = (mainWidth - waterWidth) / 2;
        int y = (mainHeight - waterHeight) / 2;

        g.drawImage(watermarkImage, x, y, null);
        g.dispose();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(mainImage, "png", baos);

        return baos.toByteArray();
    }
}