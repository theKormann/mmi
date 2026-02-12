package com.mmi.api.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;
    // Limite do Cloudinary Free: 10 MB (10485760 bytes)
    private static final long CLOUDINARY_LIMIT = 10485760;

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public String uploadFile(MultipartFile file, String folderName) throws IOException {
        byte[] fileBytes = file.getBytes();

        if (file.getSize() > CLOUDINARY_LIMIT) {
            try {
                // Tenta comprimir a imagem se for muito grande
                fileBytes = compressImage(fileBytes, file.getContentType());
            } catch (Exception e) {
                // Se falhar a compressão (ex: não é imagem), lança erro amigável ou tenta enviar assim mesmo
                System.err.println("Falha ao comprimir imagem grande: " + e.getMessage());
                // Opcional: throw new IOException("Arquivo muito grande para o Cloudinary (Max 10MB). Tente reduzir o tamanho.");
            }
        }

        Map uploadResult = cloudinary.uploader().upload(fileBytes,
                ObjectUtils.asMap("folder", folderName));
        return uploadResult.get("secure_url").toString();
    }

    private byte[] compressImage(byte[] originalBytes, String contentType) throws IOException {
        // Se não for imagem suportada, retorna os bytes originais (vai falhar no upload, mas evita erro aqui)
        if (contentType == null || !contentType.startsWith("image/")) {
            return originalBytes;
        }

        ByteArrayInputStream bais = new ByteArrayInputStream(originalBytes);
        BufferedImage image = ImageIO.read(bais);

        if (image == null) return originalBytes; // Não conseguiu decodificar

        // Lógica de Redimensionamento: Reduz pela metade as dimensões
        int targetWidth = image.getWidth() / 2;
        int targetHeight = image.getHeight() / 2;

        BufferedImage resizedImage = new BufferedImage(targetWidth, targetHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = resizedImage.createGraphics();

        // Configurações de qualidade
        graphics.setComposite(AlphaComposite.Src);
        graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        graphics.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

        graphics.drawImage(image, 0, 0, targetWidth, targetHeight, null);
        graphics.dispose();

        // Escreve de volta para array de bytes (forçando JPG para otimizar tamanho)
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(resizedImage, "jpg", baos);

        byte[] compressedBytes = baos.toByteArray();

        // Verifica se a compressão realmente ajudou
        if (compressedBytes.length < originalBytes.length) {
            return compressedBytes;
        }

        return originalBytes;
    }
}