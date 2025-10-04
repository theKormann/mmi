package com.mmi.api.controller;

import com.mmi.models.Property;
import com.mmi.models.PropertyImage;
import com.mmi.infra.PropertyRepository;
import com.mmi.infra.PropertyImageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@RestController
@RequestMapping("/api/properties")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Para desenvolvimento. Em produção, seja mais específico.
public class PropertyController {

    private final PropertyRepository propertyRepository;
    private final PropertyImageRepository imageRepository;

    // Define o diretório de uploads como uma constante para fácil manutenção.
    private static final String UPLOAD_DIRECTORY = "uploads";

    // 📦 Listar todos os imóveis
    @GetMapping
    public List<Property> getAll() {
        return propertyRepository.findAll();
    }

    // 🔍 Buscar imóvel por ID
    @GetMapping("/{id}")
    public Property getById(@PathVariable Long id) {
        return propertyRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Imóvel não encontrado: " + id));
    }

    // 🏗️ Criar um novo imóvel
    @PostMapping(consumes = "multipart/form-data")
    public Property create(
            @RequestPart("property") Property property,
            @RequestPart("mainImage") MultipartFile mainImage,
            @RequestPart(value = "gallery", required = false) MultipartFile[] gallery) throws IOException {

        // Salva a imagem principal e define o caminho no objeto
        String mainImagePath = saveFile(mainImage);
        property.setImage(mainImagePath);

        // Salva a entidade Property no banco para obter um ID
        Property savedProperty = propertyRepository.save(property);

        // Salva as imagens da galeria (se houver)
        if (gallery != null) {
            for (MultipartFile file : gallery) {
                String imagePath = saveFile(file);
                PropertyImage image = PropertyImage.builder()
                        .url(imagePath)
                        .property(savedProperty)
                        .build();
                imageRepository.save(image);
            }
        }

        return savedProperty;
    }

    // ✏️ Atualizar os dados de um imóvel (sem alterar imagens aqui)
    @PutMapping("/{id}")
    public Property update(@PathVariable Long id, @RequestBody Property propertyDetails) {
        Property existingProperty = getById(id); // Reutiliza o método que já lança exceção

        existingProperty.setTitle(propertyDetails.getTitle());
        existingProperty.setPrice(propertyDetails.getPrice());
        existingProperty.setLocation(propertyDetails.getLocation());
        existingProperty.setBedrooms(propertyDetails.getBedrooms());
        existingProperty.setBathrooms(propertyDetails.getBathrooms());
        existingProperty.setGarages(propertyDetails.getGarages());
        existingProperty.setArea(propertyDetails.getArea());
        existingProperty.setMapUrl(propertyDetails.getMapUrl());
        existingProperty.setDescription(propertyDetails.getDescription());
        existingProperty.setType(propertyDetails.getType());
        existingProperty.setTransactionType(propertyDetails.getTransactionType());

        return propertyRepository.save(existingProperty);
    }

    // ✨ NOVO: Endpoint para atualizar APENAS a imagem principal de um imóvel
    @PostMapping("/{id}/image")
    public Property updateMainImage(@PathVariable Long id, @RequestParam("mainImage") MultipartFile mainImage) throws IOException {
        Property existingProperty = getById(id);

        // Opcional: deletar a imagem antiga do disco para não acumular lixo.
        // deleteFile(existingProperty.getImage());

        String newImagePath = saveFile(mainImage);
        existingProperty.setImage(newImagePath);

        return propertyRepository.save(existingProperty);
    }


    // 🗑️ Deletar um imóvel
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!propertyRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Imóvel não encontrado: " + id);
        }
        propertyRepository.deleteById(id);
        return ResponseEntity.noContent().build(); // Retorna 204 No Content, um padrão REST
    }

    /**
     * 💾 MÉTODO DE UPLOAD DE ARQUIVO SEGURO
     * Gera um nome de arquivo único para evitar conflitos e problemas de segurança.
     *
     * @param file O arquivo enviado na requisição.
     * @return O caminho relativo do arquivo salvo (ex: /uploads/arquivo.jpg).
     */
    private String saveFile(MultipartFile file) throws IOException {
        // Gera um nome de arquivo único usando UUID para evitar sobrescrita e colisões.
        String extension = StringUtils.getFilenameExtension(file.getOriginalFilename());
        String uniqueFileName = UUID.randomUUID().toString() + "." + extension;

        // Cria o diretório se ele não existir.
        Path uploadPath = Paths.get(UPLOAD_DIRECTORY);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Resolve o caminho completo do arquivo e salva os bytes.
        Path filePath = uploadPath.resolve(uniqueFileName);
        Files.write(filePath, file.getBytes());

        // Retorna o caminho relativo que será salvo no banco e usado pelo frontend.
        return "/" + UPLOAD_DIRECTORY + "/" + uniqueFileName;
    }
}