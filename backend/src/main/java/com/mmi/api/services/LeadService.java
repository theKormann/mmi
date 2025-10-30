package com.mmi.api.services;

import com.mmi.models.Lead;
import com.mmi.models.Property;
import com.mmi.models.dto.LeadDTO;
import com.mmi.models.dto.LeadResponseDTO;
import com.mmi.infra.LeadRepository;
import com.mmi.infra.PropertyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.mmi.api.services.TrackingService;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeadService {

    private final LeadRepository leadRepository;
    private final PropertyRepository propertyRepository;
    private final TrackingService trackingService;

    public List<Lead> getAllLeads() {
        return leadRepository.findAllWithProperty();
    }

    @Transactional
    public Lead createLead(LeadDTO dto) {
        Lead newLead = new Lead();
        mapDtoToEntity(dto, newLead);

        // 1. Salva o Lead para obter um ID
        Lead savedLead = leadRepository.save(newLead);

        // 2. Associa o histórico de tracking, se o visitorId existir
        if (dto.getVisitorId() != null && !dto.getVisitorId().isEmpty()) {
            trackingService.associateEventsToLead(dto.getVisitorId(), savedLead);
        }

        return savedLead;
    }

    @Transactional
    public Lead updateLead(Long id, LeadDTO dto) {
        Lead existing = leadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lead não encontrado com id: " + id));

        mapDtoToEntity(dto, existing);
        return leadRepository.save(existing);
    }

    public void deleteLead(Long id) {
        if (!leadRepository.existsById(id)) {
            throw new RuntimeException("Lead não encontrado para exclusão com id: " + id);
        }
        leadRepository.deleteById(id);
    }

    private void mapDtoToEntity(LeadDTO dto, Lead lead) {
        lead.setNome(dto.getNome());
        lead.setEmail(dto.getEmail());
        lead.setTelefone(dto.getTelefone());
        lead.setOrigem(dto.getOrigem());
        lead.setStatus(dto.getStatus());
        lead.setInteresse(dto.getInteresse());
        lead.setDescricao(dto.getDescricao());

        if (dto.getPropertyId() != null) {
            Property property = propertyRepository.findById(dto.getPropertyId())
                    .orElseThrow(() -> new RuntimeException("Imóvel não encontrado com id: " + dto.getPropertyId()));
            lead.setProperty(property);
        } else {
            lead.setProperty(null);
        }
    }

    private LeadResponseDTO mapToLeadResponseDTO(Lead lead) {
        LeadResponseDTO dto = new LeadResponseDTO();
        dto.setId(lead.getId());
        dto.setNome(lead.getNome());
        dto.setEmail(lead.getEmail());
        dto.setTelefone(lead.getTelefone());
        dto.setOrigem(lead.getOrigem());
        dto.setStatus(lead.getStatus());
        dto.setInteresse(lead.getInteresse());
        lead.setDescricao(dto.getDescricao());
        if (lead.getProperty() != null) {
            dto.setPropertyId(lead.getProperty().getId());
            dto.setPropertyTitle(lead.getProperty().getTitle());
        }
        return dto;
    }
}