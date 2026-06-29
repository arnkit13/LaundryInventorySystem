package com.laundry.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "laundry_services")
public class LaundryService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(nullable = false)
    private Double rate;

    @Column(nullable = false, length = 50)
    private String unit;

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

    public LaundryService() {}

    public LaundryService(Long id, String name, Double rate, String unit, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.rate = rate;
        this.unit = unit;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Double getRate() { return rate; }
    public void setRate(Double rate) { this.rate = rate; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public static LaundryServiceBuilder builder() {
        return new LaundryServiceBuilder();
    }

    public static class LaundryServiceBuilder {
        private Long id;
        private String name;
        private Double rate;
        private String unit;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public LaundryServiceBuilder id(Long id) { this.id = id; return this; }
        public LaundryServiceBuilder name(String name) { this.name = name; return this; }
        public LaundryServiceBuilder rate(Double rate) { this.rate = rate; return this; }
        public LaundryServiceBuilder unit(String unit) { this.unit = unit; return this; }
        public LaundryServiceBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public LaundryServiceBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public LaundryService build() {
            return new LaundryService(id, name, rate, unit, createdAt, updatedAt);
        }
    }
}
