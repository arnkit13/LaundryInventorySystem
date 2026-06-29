package com.laundry.backend.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class TransactionRequest {
    @NotNull(message = "Date is required")
    private LocalDate date;

    private String customerName;

    @NotNull(message = "Weight in kilograms is required")
    @DecimalMin(value = "0.01", message = "Weight must be greater than 0 kg")
    private Double weightKg;

    @NotNull(message = "Soap product is required")
    private Long soapProductId;

    @NotNull(message = "Amount of soap used is required")
    @DecimalMin(value = "0.0", message = "Soap used cannot be negative")
    private Double soapUsedQty;

    @NotBlank(message = "Machine identifier is required")
    private String machineNumber;

    @NotBlank(message = "Mode of payment is required")
    private String paymentMethod; // GCash or Cash

    private String referenceNumber; // Optional (Required only for GCash on client check)

    private List<ServiceItemRequest> services = new ArrayList<>();

    public TransactionRequest() {}

    public TransactionRequest(LocalDate date, String customerName, Double weightKg, Long soapProductId, Double soapUsedQty, String machineNumber, String paymentMethod, String referenceNumber, List<ServiceItemRequest> services) {
        this.date = date;
        this.customerName = customerName;
        this.weightKg = weightKg;
        this.soapProductId = soapProductId;
        this.soapUsedQty = soapUsedQty;
        this.machineNumber = machineNumber;
        this.paymentMethod = paymentMethod;
        this.referenceNumber = referenceNumber;
        this.services = services != null ? services : new ArrayList<>();
    }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public Double getWeightKg() { return weightKg; }
    public void setWeightKg(Double weightKg) { this.weightKg = weightKg; }

    public Long getSoapProductId() { return soapProductId; }
    public void setSoapProductId(Long soapProductId) { this.soapProductId = soapProductId; }

    public Double getSoapUsedQty() { return soapUsedQty; }
    public void setSoapUsedQty(Double soapUsedQty) { this.soapUsedQty = soapUsedQty; }

    public String getMachineNumber() { return machineNumber; }
    public void setMachineNumber(String machineNumber) { this.machineNumber = machineNumber; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }

    public List<ServiceItemRequest> getServices() { return services; }
    public void setServices(List<ServiceItemRequest> services) { this.services = services; }
}
