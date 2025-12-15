package com.mmi.api.controller;

import com.mmi.api.services.AiService;
import com.mmi.models.dto.ChatRequestDTO;
import com.mmi.models.dto.ChatResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final AiService aiService;

    @PostMapping
    public ResponseEntity<ChatResponseDTO> chat(@RequestBody ChatRequestDTO request) {
        ChatResponseDTO response = aiService.processMessage(request);
        return ResponseEntity.ok(response);
    }
}