package com.mmi.api.controller;

import com.mmi.api.services.WatermarkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/media")
public class WatermarkController {

    @Autowired
    private WatermarkService watermarkService;

    @PostMapping(value = "/watermark", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> addWatermark(
            @RequestParam("file") MultipartFile file) {

        try {
            float opacity = 0.5f;

            byte[] watermarkedImage = watermarkService.addWatermark(file, opacity);

            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_PNG)
                    .body(watermarkedImage);

        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}