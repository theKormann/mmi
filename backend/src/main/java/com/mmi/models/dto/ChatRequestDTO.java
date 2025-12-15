package com.mmi.models.dto;

import lombok.Data;
import java.util.List;

@Data
public class ChatRequestDTO {
    private String message;
    private String visitorId;
    private List<MessageHistory> history;

    @Data
    public static class MessageHistory {
        private String role;
        private String content;
    }
}