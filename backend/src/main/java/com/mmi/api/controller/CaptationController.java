package com.mmi.api.controller;

import com.mmi.api.services.CaptationService;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/catch")
@CrossOrigin(origins = "*")
public class CaptationController {

    private final CaptationService captationService;

    public CaptationController(CaptationService captationService) {
        this.captationService = captationService;
    }

    @GetMapping("/captar")
    public List<String> captarImoveis(
            @RequestParam String termo,
            @RequestParam(required = false) String precoMin,
            @RequestParam(required = false) String precoMax
    ) {
        return captationService.buscarImoveis(termo, precoMin, precoMax);
    }
}