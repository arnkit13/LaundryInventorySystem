package com.laundry.backend.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "transaction_service_items")
public class TransactionServiceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id", nullable = false)
    @JsonIgnore
    private LaundryTransaction transaction;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "service_id", nullable = false)
    private LaundryService laundryService;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false)
    private Double priceAtTransaction;

    public TransactionServiceItem() {}

    public TransactionServiceItem(Long id, LaundryTransaction transaction, LaundryService laundryService, Integer quantity, Double priceAtTransaction) {
        this.id = id;
        this.transaction = transaction;
        this.laundryService = laundryService;
        this.quantity = quantity;
        this.priceAtTransaction = priceAtTransaction;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LaundryTransaction getTransaction() { return transaction; }
    public void setTransaction(LaundryTransaction transaction) { this.transaction = transaction; }

    public LaundryService getLaundryService() { return laundryService; }
    public void setLaundryService(LaundryService laundryService) { this.laundryService = laundryService; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public Double getPriceAtTransaction() { return priceAtTransaction; }
    public void setPriceAtTransaction(Double priceAtTransaction) { this.priceAtTransaction = priceAtTransaction; }

    public static TransactionServiceItemBuilder builder() {
        return new TransactionServiceItemBuilder();
    }

    public static class TransactionServiceItemBuilder {
        private Long id;
        private LaundryTransaction transaction;
        private LaundryService laundryService;
        private Integer quantity;
        private Double priceAtTransaction;

        public TransactionServiceItemBuilder id(Long id) { this.id = id; return this; }
        public TransactionServiceItemBuilder transaction(LaundryTransaction transaction) { this.transaction = transaction; return this; }
        public TransactionServiceItemBuilder laundryService(LaundryService laundryService) { this.laundryService = laundryService; return this; }
        public TransactionServiceItemBuilder quantity(Integer quantity) { this.quantity = quantity; return this; }
        public TransactionServiceItemBuilder priceAtTransaction(Double priceAtTransaction) { this.priceAtTransaction = priceAtTransaction; return this; }

        public TransactionServiceItem build() {
            return new TransactionServiceItem(id, transaction, laundryService, quantity, priceAtTransaction);
        }
    }
}
