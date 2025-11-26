package com.mmi.models;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "clauses")
public class Clause {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    public Clause() {
    }

    public Clause(String title, String content) {
        this.title = title;
        this.content = content;
    }
}