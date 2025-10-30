package com.mmi.models;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "property")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private Double price;

    @Column(length = 500)
    private String image;

    private String location;
    private int bedrooms;
    private int bathrooms;
    private int garages;
    private double area;

    @Column(length = 1000)
    private String mapUrl;

    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    private PropertyType type;

    @Enumerated(EnumType.STRING)
    private TransactionType transactionType;

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    @Builder.Default
    private List<PropertyImage> images = new ArrayList<>();

    // Enums
    public enum PropertyType { Apartamento, Casa, Cobertura, Terreno, Comercial, Rural }
    public enum TransactionType { VENDA, LOCACAO, VENDA_E_LOCACAO }
}