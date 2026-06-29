package com.laundry.backend.service;

import com.laundry.backend.dto.DashboardStats;
import com.laundry.backend.entity.LaundryTransaction;
import com.laundry.backend.entity.SoapProduct;
import com.laundry.backend.entity.Expense;
import com.laundry.backend.repository.SoapProductRepository;
import com.laundry.backend.repository.TransactionRepository;
import com.laundry.backend.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private SoapProductRepository soapProductRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    private static final double LOW_STOCK_THRESHOLD = 5.0; // In kg or liters

    public DashboardStats getStats() {
        LocalDate today = LocalDate.now();
        List<LaundryTransaction> todayTransactions = transactionRepository.findAllByDate(today);

        long totalTransactionsToday = todayTransactions.size();
        double totalKgWashedToday = todayTransactions.stream()
                .mapToDouble(LaundryTransaction::getWeightKg)
                .sum();

        long totalCustomersToday = todayTransactions.size();

        // 1. Map soap products status
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

        // 2. Fetch overall financial totals
        List<LaundryTransaction> allTransactions = transactionRepository.findAll();
        double totalRevenue = allTransactions.stream()
                .filter(t -> t.getTotalAmount() != null)
                .mapToDouble(LaundryTransaction::getTotalAmount)
                .sum();

        List<Expense> allExpenses = expenseRepository.findAll();
        double totalExpenses = allExpenses.stream()
                .filter(e -> e.getAmount() != null)
                .mapToDouble(Expense::getAmount)
                .sum();

        double netProfit = totalRevenue - totalExpenses;

        // 3. Compute Monthly Financials for charts
        // Group revenue by YearMonth (e.g. 2026-06)
        Map<YearMonth, Double> monthlyRevenue = allTransactions.stream()
                .filter(t -> t.getTotalAmount() != null && t.getDate() != null)
                .collect(Collectors.groupingBy(
                        t -> YearMonth.from(t.getDate()),
                        Collectors.summingDouble(LaundryTransaction::getTotalAmount)
                ));

        // Group expenses by YearMonth
        Map<YearMonth, Double> monthlyExpenses = allExpenses.stream()
                .filter(e -> e.getAmount() != null && e.getDate() != null)
                .collect(Collectors.groupingBy(
                        e -> YearMonth.from(e.getDate()),
                        Collectors.summingDouble(Expense::getAmount)
                ));

        // Collect all distinct YearMonths and sort them ascending
        List<YearMonth> allMonths = new ArrayList<>();
        allMonths.addAll(monthlyRevenue.keySet());
        for (YearMonth ym : monthlyExpenses.keySet()) {
            if (!allMonths.contains(ym)) {
                allMonths.add(ym);
            }
        }
        allMonths.sort(Comparator.naturalOrder());

        // Select the last 6 months (or all if less than 6) to keep the chart readable
        if (allMonths.size() > 6) {
            allMonths = allMonths.subList(allMonths.size() - 6, allMonths.size());
        }

        List<DashboardStats.MonthlyFinancialPoint> monthlyFinancials = new ArrayList<>();
        for (YearMonth ym : allMonths) {
            String monthName = ym.getMonth().getDisplayName(TextStyle.FULL, Locale.ENGLISH) + " " + ym.getYear();
            double rev = monthlyRevenue.getOrDefault(ym, 0.0);
            double exp = monthlyExpenses.getOrDefault(ym, 0.0);
            monthlyFinancials.add(new DashboardStats.MonthlyFinancialPoint(monthName, rev, exp));
        }

        return new DashboardStats(
                totalTransactionsToday,
                totalKgWashedToday,
                totalCustomersToday,
                soapStocks,
                totalRevenue,
                totalExpenses,
                netProfit,
                monthlyFinancials
        );
    }
}
