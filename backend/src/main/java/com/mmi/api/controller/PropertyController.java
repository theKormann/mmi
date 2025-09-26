package com.mmi.api.controller;

import com.mmi.models.Property;
import com.mmi.infra.PropertyRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/properties")
@CrossOrigin(origins = "*") // libera acesso do Next.js
public class PropertyController {

    private final PropertyRepository propertyRepository;

    public PropertyController(PropertyRepository propertyRepository) {
        this.propertyRepository = propertyRepository;
    }

    // READ - listar todos
    @GetMapping
    public List<Property> getAll() {
        return propertyRepository.findAll();
    }

    // READ - buscar por id
    @GetMapping("/{id}")
    public Property getById(@PathVariable Long id) {
        return propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Imóvel não encontrado: " + id));
    }

    // CREATE - cadastrar imóvel
    @PostMapping
    public Property create(@RequestBody Property property) {
        return propertyRepository.save(property);
    }

    // UPDATE - editar imóvel
    @PutMapping("/{id}")
    public Property update(@PathVariable Long id, @RequestBody Property property) {
        Property existing = propertyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Imóvel não encontrado: " + id));

        existing.setTitle(property.getTitle());
        existing.setPrice(property.getPrice());
        existing.setImage(property.getImage());
        existing.setLocation(property.getLocation());
        existing.setBedrooms(property.getBedrooms());
        existing.setBathrooms(property.getBathrooms());
        existing.setGarages(property.getGarages());
        existing.setArea(property.getArea());
        existing.setHandle(property.getHandle());

        return propertyRepository.save(existing);
    }

    // DELETE - excluir imóvel
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        if (!propertyRepository.existsById(id)) {
            throw new RuntimeException("Imóvel não encontrado: " + id);
        }
        propertyRepository.deleteById(id);
    }
}
