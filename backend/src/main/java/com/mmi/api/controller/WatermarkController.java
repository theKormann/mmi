package com.mmi.api.controller;

import com.mmi.api.services.WatermarkService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/media")
public class WatermarkController {

    @Autowired
    private WatermarkService watermarkService;

    @PostMapping(value = "/watermark")
    public void addWatermark(
            @RequestParam("file") MultipartFile file,
            HttpServletResponse response) {

        try {
            // Configura os headers da resposta antes de começar a escrever
            response.setContentType(MediaType.IMAGE_PNG_VALUE);

            float opacity = 0.5f;

            // Passa o outputStream da resposta para o serviço escrever direto nele
            watermarkService.addWatermark(file, response.getOutputStream(), opacity);

            response.flushBuffer();

        } catch (IOException e) {
            // Em caso de erro IO, tenta enviar erro 500 (se a resposta já não tiver sido iniciada)
            try {
                if (!response.isCommitted()) {
                    response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Erro ao processar imagem");
                }
            } catch (IOException ex) {
                ex.printStackTrace();
            }
        }
    }
}