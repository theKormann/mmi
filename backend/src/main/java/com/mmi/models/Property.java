package com.mmi.models;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private BigDecimal price;
    private String image; // imagem principal (URL salva localmente)
    private String location;
    private Integer bedrooms;
    private Integer bathrooms;
    private Integer garages;
    private Integer area;
    private String handle;

    @Column(name = "map_url", columnDefinition = "TEXT")
    private String mapUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    private PropertyType type;

    @Enumerated(EnumType.STRING)
    private TransactionType transactionType;

    // ✅ ANOTAÇÃO ADICIONADA
    @JsonManagedReference
    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PropertyImage> images = new ArrayList<>();
}