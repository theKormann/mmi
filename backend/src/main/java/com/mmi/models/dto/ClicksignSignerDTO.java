package com.mmi.models.dto;

import lombok.Data;

@Data
public class ClicksignSignerDTO {
    private String email;
    private String name;
    private String auths = "email";
    private String documentation;
}
