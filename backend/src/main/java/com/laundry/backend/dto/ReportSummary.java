package com.laundry.backend.dto;

import java.util.Map;

public class ReportSummary {
    private String period; // e.g. date string, week, or month
    private long transactionCount;
    private double totalKgWashed;
    private double totalSoapUsed;
    private Map<String, Long> machineUsage; // machineNumber -> count
    private Map<String, Long> branchUsage;  // branchName -> count

    public ReportSummary() {}

    public ReportSummary(String period, long transactionCount, double totalKgWashed, double totalSoapUsed, 
                         Map<String, Long> machineUsage, Map<String, Long> branchUsage) {
        this.period = period;
        this.transactionCount = transactionCount;
        this.totalKgWashed = totalKgWashed;
        this.totalSoapUsed = totalSoapUsed;
        this.machineUsage = machineUsage;
        this.branchUsage = branchUsage;
    }

    public String getPeriod() { return period; }
    public void setPeriod(String period) { this.period = period; }

    public long getTransactionCount() { return transactionCount; }
    public void setTransactionCount(long transactionCount) { this.transactionCount = transactionCount; }

    public double getTotalKgWashed() { return totalKgWashed; }
    public void setTotalKgWashed(double totalKgWashed) { this.totalKgWashed = totalKgWashed; }

    public double getTotalSoapUsed() { return totalSoapUsed; }
    public void setTotalSoapUsed(double totalSoapUsed) { this.totalSoapUsed = totalSoapUsed; }

    public Map<String, Long> getMachineUsage() { return machineUsage; }
    public void setMachineUsage(Map<String, Long> machineUsage) { this.machineUsage = machineUsage; }

    public Map<String, Long> getBranchUsage() { return branchUsage; }
    public void setBranchUsage(Map<String, Long> branchUsage) { this.branchUsage = branchUsage; }
}
