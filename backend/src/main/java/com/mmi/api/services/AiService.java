package com.mmi.api.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.mmi.infra.PropertyRepository;
import com.mmi.models.Property;
import com.mmi.models.dto.ChatRequestDTO;
import com.mmi.models.dto.ChatResponseDTO;
import com.mmi.models.dto.LeadDTO;
import com.mmi.models.dto.PropertyAiContextDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiService {

    private final PropertyRepository propertyRepository;
    private final LeadService leadService;
    private final ObjectMapper objectMapper;

    @Value("${openai.api.key}")
    private String apiKey;

    private static final String OPENAI_URL = "https://api.openai.com/v1/chat/completions";

    public ChatResponseDTO processMessage(ChatRequestDTO request) {
        // 1. Buscar contexto de imóveis (RAG Simplificado)
        // DICA: Em produção, filtre apenas campos essenciais para economizar tokens
        List<Property> properties = propertyRepository.findAll();
        String propertyContext = formatPropertiesForAi(properties);

        // 2. Construir o Prompt do Sistema
        String systemPrompt = buildSystemPrompt(propertyContext);

        // 3. Montar o payload para a OpenAI
        Map<String, Object> requestBody = buildOpenAiRequest(systemPrompt, request.getHistory(), request.getMessage());

        // 4. Chamar a API
        String aiRawResponse = callOpenAi(requestBody);

        // 5. Processar a resposta (Separar Texto vs Dados de Lead)
        return parseAndHandleLead(aiRawResponse, request.getVisitorId());
    }

    private String formatPropertiesForAi(List<Property> properties) {
        return properties.stream()
                .map(p -> new PropertyAiContextDTO(
                        p.getId(),
                        p.getType().toString(),
                        p.getLocation(), // Assumindo que location é o Bairro/Cidade
                        p.getPrice(),
                        p.getBedrooms()
                ).toString())
                .collect(Collectors.joining("\n"));
    }

    private String buildSystemPrompt(String propertyContext) {
        return """
            Você é um corretor virtual inteligente da MMI Imobiliária.
            Sua meta é ajudar o cliente a encontrar o imóvel ideal e coletar seus dados de contato sutilmente.
            
            %s
            
            DIRETRIZES:
            1. Use a lista acima para recomendar imóveis. Se o cliente pedir algo que existe na lista, recomende fornecendo o ID ou Link.
            2. Se o cliente pedir algo que NÃO existe, seja honesto, mas peça o contato para avisar quando chegar.
            3. Tente descobrir o que o cliente quer (Compra/Aluguel, Bairro, Preço).
            4. Se o cliente fornecer Nome, Telefone ou Email, você DEVE extrair esses dados.
            
            PROTOCOLO DE EXTRAÇÃO DE LEAD:
            Se você identificar intenção clara ou dados de contato, no FINAL da sua resposta, adicione um bloco JSON oculto EXATAMENTE neste formato (não use markdown code blocks ```):
            
            |||LEAD_DATA_START|||
            {
              "nome": "...",
              "telefone": "...",
              "email": "...",
              "interesse": "Resumo do que ele quer",
              "propertyId": 123 (se ele mostrou interesse num específico, senão null)
            }
            |||LEAD_DATA_END|||
            """.formatted(propertyContext);
    }

    private ChatResponseDTO parseAndHandleLead(String aiText, String visitorId) {
        String responseText = aiText;
        boolean leadCaptured = false;

        // Regex para extrair o JSON escondido
        Pattern pattern = Pattern.compile("\\|\\|\\|LEAD_DATA_START\\|\\|\\|(.*?)\\|\\|\\|LEAD_DATA_END\\|\\|\\|", Pattern.DOTALL);
        Matcher matcher = pattern.matcher(aiText);

        if (matcher.find()) {
            String jsonRaw = matcher.group(1);
            responseText = aiText.replace(matcher.group(0), "").trim(); // Remove o JSON da resposta visível

            try {
                LeadDTO extractedLead = objectMapper.readValue(jsonRaw, LeadDTO.class);

                // Enriquece com dados técnicos
                extractedLead.setOrigem("IA Chat");
                extractedLead.setStatus("Novo");
                extractedLead.setVisitorId(visitorId);

                // Salva no banco
                log.info("Lead capturado pela IA: {}", extractedLead);
                leadService.createOrUpdateLeadFromAi(extractedLead);
                leadCaptured = true;

            } catch (Exception e) {
                log.error("Erro ao parsear lead da IA", e);
            }
        }

        return new ChatResponseDTO(responseText, leadCaptured);
    }

    // Métodos auxiliares de HTTP (simplificados)
    private Map<String, Object> buildOpenAiRequest(String systemPrompt, List<ChatRequestDTO.MessageHistory> history, String currentMsg) {
        ArrayNode messages = objectMapper.createArrayNode();

        // System Prompt
        messages.add(objectMapper.createObjectNode().put("role", "system").put("content", systemPrompt));

        // History (limite os últimos 6 para não estourar tokens)
        if (history != null) {
            history.stream().limit(6).forEach(h ->
                    messages.add(objectMapper.createObjectNode().put("role", h.getRole()).put("content", h.getContent()))
            );
        }

        // Current User Message
        messages.add(objectMapper.createObjectNode().put("role", "user").put("content", currentMsg));

        Map<String, Object> body = new HashMap<>();
        body.put("model", "gpt-3.5-turbo"); // Ou gpt-4o-mini (mais barato e rápido)
        body.put("messages", messages);
        body.put("temperature", 0.7);

        return body;
    }

    private String callOpenAi(Map<String, Object> body) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            Map response = restTemplate.postForObject(OPENAI_URL, entity, Map.class);
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
            return (String) message.get("content");
        } catch (Exception e) {
            log.error("Erro ao chamar OpenAI", e);
            return "Desculpe, estou com uma instabilidade momentânea. Pode repetir?";
        }
    }
}