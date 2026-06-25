package com.laundry.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "laundry_transactions")
public class LaundryTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate date;

    @Column(length = 100)
    private String customerName;

    @Column(nullable = false)
    private Double weightKg;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "soap_product_id", nullable = false)
    private SoapProduct soapProduct;

    @Column(nullable = false)
    private Double soapUsedQty;

    @Column(nullable = false)
    private Double soapRemainingQty; // stock level recorded after this transaction

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // employee who recorded it

    @Column(length = 50)
    private String machineNumber; // the washing machine identifier

    @ManyToOne(fetch = FetchType.EAGER, optional = true)
    @JoinColumn(name = "branch_id")
    private Branch branch; // branch where transaction occurred

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public LaundryTransaction() {}

    public LaundryTransaction(Long id, LocalDate date, String customerName, Double weightKg, SoapProduct soapProduct,
                              Double soapUsedQty, Double soapRemainingQty, User user, String machineNumber, Branch branch, LocalDateTime createdAt) {
        this.id = id;
        this.date = date;
        this.customerName = customerName;
        this.weightKg = weightKg;
        this.soapProduct = soapProduct;
        this.soapUsedQty = soapUsedQty;
        this.soapRemainingQty = soapRemainingQty;
        this.user = user;
        this.machineNumber = machineNumber;
        this.branch = branch;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public Double getWeightKg() { return weightKg; }
    public void setWeightKg(Double weightKg) { this.weightKg = weightKg; }

    public SoapProduct getSoapProduct() { return soapProduct; }
    public void setSoapProduct(SoapProduct soapProduct) { this.soapProduct = soapProduct; }

    public Double getSoapUsedQty() { return soapUsedQty; }
    public void setSoapUsedQty(Double soapUsedQty) { this.soapUsedQty = soapUsedQty; }

    public Double getSoapRemainingQty() { return soapRemainingQty; }
    public void setSoapRemainingQty(Double soapRemainingQty) { this.soapRemainingQty = soapRemainingQty; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getMachineNumber() { return machineNumber; }
    public void setMachineNumber(String machineNumber) { this.machineNumber = machineNumber; }

    public Branch getBranch() { return branch; }
    public void setBranch(Branch branch) { this.branch = branch; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Custom Builder
    public static LaundryTransactionBuilder builder() {
        return new LaundryTransactionBuilder();
    }

    public static class LaundryTransactionBuilder {
        private Long id;
        private LocalDate date;
        private String customerName;
        private Double weightKg;
        private SoapProduct soapProduct;
        private Double soapUsedQty;
        private Double soapRemainingQty;
        private User user;
        private String machineNumber;
        private Branch branch;
        private LocalDateTime createdAt;

        public LaundryTransactionBuilder id(Long id) { this.id = id; return this; }
        public LaundryTransactionBuilder date(LocalDate date) { this.date = date; return this; }
        public LaundryTransactionBuilder customerName(String customerName) { this.customerName = customerName; return this; }
        public LaundryTransactionBuilder weightKg(Double weightKg) { this.weightKg = weightKg; return this; }
        public LaundryTransactionBuilder soapProduct(SoapProduct soapProduct) { this.soapProduct = soapProduct; return this; }
        public LaundryTransactionBuilder soapUsedQty(Double soapUsedQty) { this.soapUsedQty = soapUsedQty; return this; }
        public LaundryTransactionBuilder soapRemainingQty(Double soapRemainingQty) { this.soapRemainingQty = soapRemainingQty; return this; }
        public LaundryTransactionBuilder user(User user) { this.user = user; return this; }
        public LaundryTransactionBuilder machineNumber(String machineNumber) { this.machineNumber = machineNumber; return this; }
        public LaundryTransactionBuilder branch(Branch branch) { this.branch = branch; return this; }
        public LaundryTransactionBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public LaundryTransaction build() {
            return new LaundryTransaction(id, date, customerName, weightKg, soapProduct, soapUsedQty, soapRemainingQty, user, machineNumber, branch, createdAt);
        }
    }
}
