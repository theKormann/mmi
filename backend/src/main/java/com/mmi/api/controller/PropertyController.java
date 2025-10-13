package com.mmi.api.controller;

import com.mmi.api.services.PropertyService;
import com.mmi.models.Property;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PropertyController {

    private final PropertyService propertyService;

    @GetMapping
    public List<Property> getAll() {
        return propertyService.getAllProperties();
    }

    @GetMapping("/{id}")
    public Property getById(@PathVariable Long id) {
        return propertyService.getPropertyById(id);
    }

    @PostMapping(consumes = "multipart/form-data")
    public Property create(
            @RequestPart("property") Property property,
            @RequestPart("mainImage") MultipartFile mainImage,
            @RequestPart(value = "gallery", required = false) List<MultipartFile> gallery) throws IOException {
        return propertyService.createProperty(property, mainImage, gallery);
    }

    @PutMapping("/{id}")
    public Property update(@PathVariable Long id, @RequestBody Property propertyDetails) {
        return propertyService.updateProperty(id, propertyDetails);
    }

    // 🖼️ Adicionar novas imagens a um imóvel existente
    @PostMapping("/{id}/images")
    public ResponseEntity<Void> addImagesToProperty(
            @PathVariable Long id,
            @RequestParam(value = "mainImage", required = false) MultipartFile mainImage,
            @RequestParam(value = "gallery", required = false) List<MultipartFile> gallery) throws IOException {
        propertyService.addImagesToProperty(id, mainImage, gallery);
        return ResponseEntity.ok().build();
    }

    // 🗑️ Deletar imagens da galeria
    @DeleteMapping("/images")
    public ResponseEntity<Void> deletePropertyImages(@RequestBody List<Long> imageIds) {
        propertyService.deletePropertyImages(imageIds);
        return ResponseEntity.noContent().build();
    }

    // 🗑️ Deletar imóvel
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        propertyService.deleteProperty(id);
        return ResponseEntity.noContent().build();
    }
}