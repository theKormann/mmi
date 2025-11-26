package com.mmi.api.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
public class CaptationService {

    @Value("${google.api.key}")
    private String googleApiKey;

    @Value("${google.cx.id}")
    private String googleCxId;

    private static final String GOOGLE_SEARCH_URL = "https://www.googleapis.com/customsearch/v1";

    // ATUALIZE A ASSINATURA DO MÉTODO
    public List<String> buscarImoveis(String termo, String precoMin, String precoMax) {
        List<String> links = new ArrayList<>();
        try {
            String sitesParaPesquisar = " (site:*.olx.com.br OR site:www.facebook.com/marketplace* OR site:valentinacaran.com.br)";

            StringBuilder precoQuery = new StringBuilder();
            boolean hasMin = precoMin != null && !precoMin.trim().isEmpty();
            boolean hasMax = precoMax != null && !precoMax.trim().isEmpty();

            if (hasMin || hasMax) {
                precoQuery.append(" R$");
                if (hasMin) {
                    precoQuery.append(precoMin.trim());
                }
                precoQuery.append("..");
                if (hasMax) {
                    precoQuery.append(precoMax.trim());
                }
            }
            String termoCompleto = termo + sitesParaPesquisar + precoQuery.toString();

            String encodedTermo = URLEncoder.encode(termoCompleto, StandardCharsets.UTF_8);

            String query = String.format("%s?q=%s&key=%s&cx=%s",
                    GOOGLE_SEARCH_URL,
                    encodedTermo,
                    googleApiKey,
                    googleCxId);

            // Log para depuração (opcional, mas útil)
            System.out.println("Google Search Query URL: " + query);

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(query))
                    .GET()
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            System.out.println("Google Search Response Status: " + response.statusCode());

            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(response.body());

            JsonNode items = root.get("items");
            if (items != null && items.isArray()) {
                for (JsonNode item : items) {
                    String link = item.get("link").asText();
                    links.add(link);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return links;
    }
}