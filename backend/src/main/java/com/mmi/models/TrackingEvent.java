package com.mmi.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.mmi.models.Lead;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "tracking_events")
public class TrackingEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // TrackingEvent.java
    @ManyToOne
    @JoinColumn(name = "lead_id")
    @JsonBackReference
    private Lead lead;


    @Column(nullable = false, updatable = false)
    private String visitorId;

    @Column(nullable = false)
    private String eventType;

    private String url;

    private Long propertyId;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private String ipAddress;
    private String country;
    private String region;
    private String city;

}