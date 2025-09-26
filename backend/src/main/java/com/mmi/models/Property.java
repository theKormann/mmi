package com.mmi.models;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

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
    private String image;
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

    // --- CAMPO ADICIONADO AQUI ---
    @Enumerated(EnumType.STRING)
    private PropertyType type;
}