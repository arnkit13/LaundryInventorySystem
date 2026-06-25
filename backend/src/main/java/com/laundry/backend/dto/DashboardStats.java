package com.laundry.backend.dto;

import java.util.List;

public class DashboardStats {
    private long totalTransactionsToday;
    private double totalKgWashedToday;
    private long totalCustomersToday;
    private List<SoapStockStatus> soapStocks;

    public DashboardStats() {}

    public DashboardStats(long totalTransactionsToday, double totalKgWashedToday, long totalCustomersToday, List<SoapStockStatus> soapStocks) {
        this.totalTransactionsToday = totalTransactionsToday;
        this.totalKgWashedToday = totalKgWashedToday;
        this.totalCustomersToday = totalCustomersToday;
        this.soapStocks = soapStocks;
    }

    public long getTotalTransactionsToday() { return totalTransactionsToday; }
    public void setTotalTransactionsToday(long totalTransactionsToday) { this.totalTransactionsToday = totalTransactionsToday; }

    public double getTotalKgWashedToday() { return totalKgWashedToday; }
    public void setTotalKgWashedToday(double totalKgWashedToday) { this.totalKgWashedToday = totalKgWashedToday; }

    public long getTotalCustomersToday() { return totalCustomersToday; }
    public void setTotalCustomersToday(long totalCustomersToday) { this.totalCustomersToday = totalCustomersToday; }

    public List<SoapStockStatus> getSoapStocks() { return soapStocks; }
    public void setSoapStocks(List<SoapStockStatus> soapStocks) { this.soapStocks = soapStocks; }

    public static class SoapStockStatus {
        private Long id;
        private String name;
        private Double currentStock;
        private String unit;
        private boolean isLow; // true if currentStock is below threshold (e.g., 5.0)

        public SoapStockStatus() {}

        public SoapStockStatus(Long id, String name, Double currentStock, String unit, boolean isLow) {
            this.id = id;
            this.name = name;
            this.currentStock = currentStock;
            this.unit = unit;
            this.isLow = isLow;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public Double getCurrentStock() { return currentStock; }
        public void setCurrentStock(Double currentStock) { this.currentStock = currentStock; }

        public String getUnit() { return unit; }
        public void setUnit(String unit) { this.unit = unit; }

        public boolean isLow() { return isLow; }
        public void setLow(boolean low) { isLow = low; }
    }
}
