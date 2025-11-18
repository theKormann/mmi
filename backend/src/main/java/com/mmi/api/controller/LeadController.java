package com.mmi.api.controller;

import com.mmi.api.services.LeadService;
import com.mmi.models.Lead;
import com.mmi.models.dto.LeadDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leads")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LeadController {

    private final LeadService leadService;

    @GetMapping
    public ResponseEntity<List<Lead>> listarLeads() {
        List<Lead> leads = leadService.getAllLeads();
        return ResponseEntity.ok(leads);
    }

    @PostMapping
    public ResponseEntity<Lead> createLead(@RequestBody LeadDTO dto) {
        Lead newLead = leadService.createLead(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(newLead);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Lead> update(@PathVariable Long id, @RequestBody LeadDTO dto) {
        Lead updatedLead = leadService.updateLead(id, dto);
        return ResponseEntity.ok(updatedLead);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        leadService.deleteLead(id);
        return ResponseEntity.noContent().build();
    }
}