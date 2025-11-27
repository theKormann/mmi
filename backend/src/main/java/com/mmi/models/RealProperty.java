package com.mmi.models;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Entity
@Table(name = "real_properties")
public class RealProperty {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String address;
    private String type;
    private String status;

    private BigDecimal price;

    private String tenantName;
    private LocalDate contractStart;
    private LocalDate contractEnd;

    @Column(length = 500)
    private String description;
}