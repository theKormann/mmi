package com.mmi.api.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/webhooks")
public class WebhookController {

    @PostMapping("/clicksign")
    public void handleClicksignWebhook(@RequestBody Map<String, Object> payload) {
        Map<String, Object> event = (Map<String, Object>) payload.get("event");
        Map<String, Object> document = (Map<String, Object>) payload.get("document");

        String eventType = (String) event.get("name"); // ex: "auto_close", "sign"
        String docKey = (String) document.get("key");

        if ("auto_close".equals(eventType)) {
            // O documento foi finalizado (todos assinaram)
            // 1. Buscar contrato no seu banco pelo docKey
            // 2. Atualizar status para "ASSINADO"
            // 3. (Opcional) Baixar o PDF assinado e salvar no S3/Blob Storage
            System.out.println("Documento " + docKey + " foi finalizado!");
        }
    }
}
