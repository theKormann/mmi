package com.mmi.models.dto;

public record PropertyAiContextDTO(Long id, String tipo, String bairro, Double preco, int quartos) {
    @Override
    public String toString() {
        return String.format("[ID:%d] %s no %s, R$ %.0f, %d quartos.", id, tipo, bairro, preco, quartos);
    }
}