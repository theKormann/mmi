package com.mmi.api.controllers;

import com.mmi.infra.RealPropertyRepository;
import com.mmi.models.RealProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/realls")
@CrossOrigin(origins = "*") // Configurar conforme segurança necessária
public class RealPropertyController {

    private final RealPropertyRepository repository;

    public RealPropertyController(RealPropertyRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<RealProperty> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public RealProperty create(@RequestBody RealProperty property) {
        return repository.save(property);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RealProperty> update(@PathVariable Long id, @RequestBody RealProperty updated) {
        return repository.findById(id)
                .map(record -> {
                    record.setTitle(updated.getTitle());
                    record.setAddress(updated.getAddress());
                    record.setType(updated.getType());
                    record.setStatus(updated.getStatus());
                    record.setPrice(updated.getPrice());
                    record.setTenantName(updated.getTenantName());
                    record.setContractStart(updated.getContractStart());
                    record.setContractEnd(updated.getContractEnd());
                    record.setDescription(updated.getDescription());
                    RealProperty saved = repository.save(record);
                    return ResponseEntity.ok(saved);
                }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return repository.findById(id)
                .map(record -> {
                    repository.deleteById(id);
                    return ResponseEntity.ok().build();
                }).orElse(ResponseEntity.notFound().build());
    }
}