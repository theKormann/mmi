package com.mmi.api.services;

import com.mmi.infra.PropertyImageRepository;
import com.mmi.infra.PropertyRepository;
import com.mmi.models.Property;
import com.mmi.models.PropertyImage;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PropertyService {

    private final PropertyRepository propertyRepository;
    private final CloudinaryService cloudinaryService;
    private final PropertyImageRepository imageRepository;

    public List<Property> getAllProperties() {
        return propertyRepository.findAll();
    }

    public Property getPropertyById(Long id) {
        return propertyRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Imóvel não encontrado: " + id));
    }

    @Transactional
    public Property createProperty(Property property, MultipartFile mainImage, List<MultipartFile> gallery) throws IOException {
        // 1. Prepara e salva a entidade "pai" (Property) primeiro.
        if (mainImage != null && !mainImage.isEmpty()) {
            String mainImageUrl = cloudinaryService.uploadFile(mainImage, "mmi/properties/main");
            property.setImage(mainImageUrl);
        }
        property.setImages(new ArrayList<>());
        Property savedProperty = propertyRepository.saveAndFlush(property);

        // 2. Processa e salva as imagens "filhas" (PropertyImage).
        if (gallery != null && !gallery.isEmpty()) {
            List<PropertyImage> imagesToSave = new ArrayList<>();
            for (MultipartFile file : gallery) {
                if (!file.isEmpty()) {
                    String imageUrl = cloudinaryService.uploadFile(file, "mmi/properties/gallery");
                    PropertyImage image = PropertyImage.builder()
                            .url(imageUrl)
                            .property(savedProperty)
                            .build();
                    imagesToSave.add(image);
                }
            }
            imageRepository.saveAll(imagesToSave);
        }

        // 3. Retorna o imóvel completo.
        return propertyRepository.findById(savedProperty.getId()).orElseThrow();
    }

    @Transactional
    public Property updateProperty(Long id, Property propertyDetails) {
        Property existingProperty = getPropertyById(id);
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

    @Transactional
    public void addImagesToProperty(Long propertyId, MultipartFile mainImage, List<MultipartFile> gallery) throws IOException {
        // 1. Busca a entidade "pai" que já existe.
        Property property = getPropertyById(propertyId);

        // 2. Atualiza a imagem principal, se uma nova foi enviada, e salva.
        if (mainImage != null && !mainImage.isEmpty()) {
            String mainImageUrl = cloudinaryService.uploadFile(mainImage, "mmi/properties/main");
            property.setImage(mainImageUrl);
            propertyRepository.save(property);
        }

        // 3. ❗ CORREÇÃO AQUI ❗
        // Salva as novas imagens da galeria explicitamente, em vez de confiar no cascade.
        if (gallery != null && !gallery.isEmpty()) {
            List<PropertyImage> newImages = new ArrayList<>();
            for (MultipartFile file : gallery) {
                if (!file.isEmpty()) {
                    String imageUrl = cloudinaryService.uploadFile(file, "mmi/properties/gallery");
                    PropertyImage image = PropertyImage.builder()
                            .url(imageUrl)
                            .property(property) // Vincula à propriedade existente.
                            .build();
                    newImages.add(image);
                }
            }
            imageRepository.saveAll(newImages); // Salva as novas imagens no banco.
        }
    }

    @Transactional
    public void deletePropertyImages(List<Long> imageIds) {
        imageRepository.deleteAllById(imageIds);
    }

    public void deleteProperty(Long id) {
        if (!propertyRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Imóvel não encontrado: " + id);
        }
        propertyRepository.deleteById(id);
    }
}