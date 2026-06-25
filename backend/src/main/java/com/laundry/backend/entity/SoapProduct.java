package com.laundry.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "soap_products")
public class SoapProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(nullable = false)
    private Double quantity; // current stock level

    @Column(nullable = false, length = 20)
    private String unit; // 'kg', 'liters', etc.

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public SoapProduct() {}

    public SoapProduct(Long id, String name, Double quantity, String unit, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.quantity = quantity;
        this.unit = unit;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Double getQuantity() { return quantity; }
    public void setQuantity(Double quantity) { this.quantity = quantity; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Custom Builder
    public static SoapProductBuilder builder() {
        return new SoapProductBuilder();
    }

    public static class SoapProductBuilder {
        private Long id;
        private String name;
        private Double quantity;
        private String unit;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public SoapProductBuilder id(Long id) { this.id = id; return this; }
        public SoapProductBuilder name(String name) { this.name = name; return this; }
        public SoapProductBuilder quantity(Double quantity) { this.quantity = quantity; return this; }
        public SoapProductBuilder unit(String unit) { this.unit = unit; return this; }
        public SoapProductBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public SoapProductBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public SoapProduct build() {
            return new SoapProduct(id, name, quantity, unit, createdAt, updatedAt);
        }
    }
}
