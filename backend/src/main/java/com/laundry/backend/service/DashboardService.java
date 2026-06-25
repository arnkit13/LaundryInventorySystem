package com.laundry.backend.service;

import com.laundry.backend.dto.DashboardStats;
import com.laundry.backend.entity.LaundryTransaction;
import com.laundry.backend.entity.SoapProduct;
import com.laundry.backend.repository.SoapProductRepository;
import com.laundry.backend.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private SoapProductRepository soapProductRepository;

    private static final double LOW_STOCK_THRESHOLD = 5.0; // In kg or liters

    public DashboardStats getStats() {
        LocalDate today = LocalDate.now();
        List<LaundryTransaction> todayTransactions = transactionRepository.findAllByDate(today);

        long totalTransactionsToday = todayTransactions.size();
        double totalKgWashedToday = todayTransactions.stream()
                .mapToDouble(LaundryTransaction::getWeightKg)
                .sum();

        // Count customer names. If empty, count as a unique customer.
        long totalCustomersToday = todayTransactions.size();

        // Map soap products status
        List<SoapProduct> products = soapProductRepository.findAll();
        List<DashboardStats.SoapStockStatus> soapStocks = products.stream()
                .map(product -> new DashboardStats.SoapStockStatus(
                        product.getId(),
                        product.getName(),
                        product.getQuantity(),
                        product.getUnit(),
                        product.getQuantity() < LOW_STOCK_THRESHOLD
                ))
                .collect(Collectors.toList());

        return new DashboardStats(
                totalTransactionsToday,
                totalKgWashedToday,
                totalCustomersToday,
                soapStocks
        );
    }
}
