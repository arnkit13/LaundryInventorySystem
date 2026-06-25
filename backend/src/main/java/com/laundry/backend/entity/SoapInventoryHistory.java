package com.laundry.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "soap_inventory_history")
public class SoapInventoryHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "soap_product_id", nullable = false)
    private SoapProduct soapProduct;

    @Column(nullable = false, length = 20)
    private String transactionType; // 'ADD_STOCK', 'USE_STOCK', 'ADJUST_STOCK'

    @Column(nullable = false)
    private Double quantityChanged;

    @Column(nullable = false)
    private Double previousQuantity;

    @Column(nullable = false)
    private Double newQuantity;

    @Column(length = 255)
    private String notes;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "performed_by", nullable = false)
    private User performedBy;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public SoapInventoryHistory() {}

    public SoapInventoryHistory(Long id, SoapProduct soapProduct, String transactionType, Double quantityChanged,
                                Double previousQuantity, Double newQuantity, String notes, User performedBy, LocalDateTime createdAt) {
        this.id = id;
        this.soapProduct = soapProduct;
        this.transactionType = transactionType;
        this.quantityChanged = quantityChanged;
        this.previousQuantity = previousQuantity;
        this.newQuantity = newQuantity;
        this.notes = notes;
        this.performedBy = performedBy;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public SoapProduct getSoapProduct() { return soapProduct; }
    public void setSoapProduct(SoapProduct soapProduct) { this.soapProduct = soapProduct; }

    public String getTransactionType() { return transactionType; }
    public void setTransactionType(String transactionType) { this.transactionType = transactionType; }

    public Double getQuantityChanged() { return quantityChanged; }
    public void setQuantityChanged(Double quantityChanged) { this.quantityChanged = quantityChanged; }

    public Double getPreviousQuantity() { return previousQuantity; }
    public void setPreviousQuantity(Double previousQuantity) { this.previousQuantity = previousQuantity; }

    public Double getNewQuantity() { return newQuantity; }
    public void setNewQuantity(Double newQuantity) { this.newQuantity = newQuantity; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public User getPerformedBy() { return performedBy; }
    public void setPerformedBy(User performedBy) { this.performedBy = performedBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Custom Builder
    public static SoapInventoryHistoryBuilder builder() {
        return new SoapInventoryHistoryBuilder();
    }

    public static class SoapInventoryHistoryBuilder {
        private Long id;
        private SoapProduct soapProduct;
        private String transactionType;
        private Double quantityChanged;
        private Double previousQuantity;
        private Double newQuantity;
        private String notes;
        private User performedBy;
        private LocalDateTime createdAt;

        public SoapInventoryHistoryBuilder id(Long id) { this.id = id; return this; }
        public SoapInventoryHistoryBuilder soapProduct(SoapProduct soapProduct) { this.soapProduct = soapProduct; return this; }
        public SoapInventoryHistoryBuilder transactionType(String transactionType) { this.transactionType = transactionType; return this; }
        public SoapInventoryHistoryBuilder quantityChanged(Double quantityChanged) { this.quantityChanged = quantityChanged; return this; }
        public SoapInventoryHistoryBuilder previousQuantity(Double previousQuantity) { this.previousQuantity = previousQuantity; return this; }
        public SoapInventoryHistoryBuilder newQuantity(Double newQuantity) { this.newQuantity = newQuantity; return this; }
        public SoapInventoryHistoryBuilder notes(String notes) { this.notes = notes; return this; }
        public SoapInventoryHistoryBuilder performedBy(User performedBy) { this.performedBy = performedBy; return this; }
        public SoapInventoryHistoryBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public SoapInventoryHistory build() {
            return new SoapInventoryHistory(id, soapProduct, transactionType, quantityChanged, previousQuantity, newQuantity, notes, performedBy, createdAt);
        }
    }
}
