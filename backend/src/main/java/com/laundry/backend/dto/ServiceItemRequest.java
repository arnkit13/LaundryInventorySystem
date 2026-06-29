package com.laundry.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class ServiceItemRequest {
    @NotNull(message = "Service ID is required")
    private Long serviceId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    private Double priceAtTransaction; // Optional custom price override by Admin

    public ServiceItemRequest() {}

    public ServiceItemRequest(Long serviceId, Integer quantity) {
        this.serviceId = serviceId;
        this.quantity = quantity;
    }

    public ServiceItemRequest(Long serviceId, Integer quantity, Double priceAtTransaction) {
        this.serviceId = serviceId;
        this.quantity = quantity;
        this.priceAtTransaction = priceAtTransaction;
    }

    public Long getServiceId() { return serviceId; }
    public void setServiceId(Long serviceId) { this.serviceId = serviceId; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Double getPriceAtTransaction() { return priceAtTransaction; }
    public void setPriceAtTransaction(Double priceAtTransaction) { this.priceAtTransaction = priceAtTransaction; }
}
