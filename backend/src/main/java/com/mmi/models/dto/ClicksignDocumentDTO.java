package com.mmi.models.dto;

import lombok.Data;

@Data
public class ClicksignDocumentDTO {
    private String path;
    private String content_base64;
    private String deadline_at;
    private boolean auto_close = true;
    private String locale = "pt-BR";
}