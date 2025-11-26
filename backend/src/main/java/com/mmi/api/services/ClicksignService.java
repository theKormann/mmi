package com.mmi.api.services;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mmi.models.dto.SignatureDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.http.MediaType;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
public class ClicksignService {

    private final RestClient restClient;
    private final String accessToken;
    private final ObjectMapper objectMapper;

    // Construtor injetando os valores do application.properties
    public ClicksignService(@Value("${clicksign.base.url}") String baseUrl,
                            @Value("${clicksign.access.token}") String accessToken,
                            ObjectMapper objectMapper) {
        this.accessToken = accessToken;
        this.objectMapper = objectMapper;

        // Configura o cliente HTTP com a URL base (Sandbox ou Prod)
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader("Accept", "application/json")
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    // Método auxiliar para adicionar o token na URL (Padrão da Clicksign)
    private String getAuthParam() {
        return "?access_token=" + this.accessToken;
    }

    // 1. Upload do PDF
    public String uploadDocument(byte[] pdfBytes, String fileName) {
        try {
            // Converte PDF para Base64 (exigência da API)
            String base64Content = "data:application/pdf;base64," + Base64.getEncoder().encodeToString(pdfBytes);

            Map<String, Object> documentBody = new HashMap<>();
            documentBody.put("path", "/contratos/" + fileName);
            documentBody.put("content_base64", base64Content);
            documentBody.put("deadline_at", java.time.LocalDate.now().plusDays(30).toString()); // Prazo de 30 dias
            documentBody.put("auto_close", true); // Fecha documento ao finalizar assinaturas
            documentBody.put("locale", "pt-BR");

            Map<String, Object> payload = new HashMap<>();
            payload.put("document", documentBody);

            // POST /documents?access_token=...
            Map response = restClient.post()
                    .uri("/documents" + getAuthParam())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .body(Map.class);

            Map<String, Object> docData = (Map<String, Object>) response.get("document");
            return (String) docData.get("key");

        } catch (Exception e) {
            throw new RuntimeException("Erro ao fazer upload para Clicksign: " + e.getMessage(), e);
        }
    }

    // 2. Criar Signatário (Signer)
    public String createSigner(SignatureDTO dto) {
        try {
            Map<String, Object> signerBody = new HashMap<>();
            signerBody.put("email", dto.getEmail());
            signerBody.put("name", dto.getSignerName());
            signerBody.put("auths", new String[]{"email"}); // Autenticação por email
            signerBody.put("documentation", dto.getCpf());  // CPF (Importante para validade jurídica)
            signerBody.put("has_documentation", true);

            Map<String, Object> payload = new HashMap<>();
            payload.put("signer", signerBody);

            // POST /signers?access_token=...
            Map response = restClient.post()
                    .uri("/signers" + getAuthParam())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .body(Map.class);

            Map<String, Object> signerData = (Map<String, Object>) response.get("signer");
            return (String) signerData.get("key");

        } catch (Exception e) {
            // Se der erro 422, pode ser que o signatário já exista.
            // Em uma implementação robusta, você capturaria e buscaria o signatário existente.
            throw new RuntimeException("Erro ao criar signatário na Clicksign: " + e.getMessage(), e);
        }
    }

    // 3. Adicionar Signatário à Lista do Documento (Vínculo)
    public void addSignerToDocument(String documentKey, String signerKey, String role) {
        try {
            Map<String, Object> listBody = new HashMap<>();
            listBody.put("document_key", documentKey);
            listBody.put("signer_key", signerKey);
            listBody.put("sign_as", convertRoleToClicksign(role)); // ex: 'contractor', 'party'
            listBody.put("message", "Por favor, assine o contrato digitalmente.");

            Map<String, Object> payload = new HashMap<>();
            payload.put("list", listBody);

            // POST /lists?access_token=...
            restClient.post()
                    .uri("/lists" + getAuthParam())
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity(); // Retorna void se der sucesso (201 Created)

        } catch (Exception e) {
            throw new RuntimeException("Erro ao vincular signatário ao documento: " + e.getMessage(), e);
        }
    }

    // Helper simples para converter papéis do seu sistema para a Clicksign
    private String convertRoleToClicksign(String role) {
        if (role == null) return "party";
        return switch (role.toLowerCase()) {
            case "locador", "contratado" -> "contractor";
            case "locatário", "contratante" -> "contractee";
            case "testemunha" -> "witness";
            case "fiador" -> "guarantor"; // Pode precisar ajustar conforme API docs
            default -> "party"; // 'party' é genérico (parte envolvida)
        };
    }
}