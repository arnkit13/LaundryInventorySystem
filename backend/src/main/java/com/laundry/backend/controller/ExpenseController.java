package com.laundry.backend.controller;

import com.laundry.backend.entity.Expense;
import com.laundry.backend.entity.Branch;
import com.laundry.backend.repository.ExpenseRepository;
import com.laundry.backend.repository.BranchRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
@PreAuthorize("hasRole('ADMIN')")
public class ExpenseController {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private BranchRepository branchRepository;

    @GetMapping
    public ResponseEntity<List<Expense>> getAllExpenses() {
        return ResponseEntity.ok(expenseRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<Expense> createExpense(@Valid @RequestBody Expense expense) {
        if (expense.getBranch() != null && expense.getBranch().getId() != null) {
            Branch branch = branchRepository.findById(expense.getBranch().getId())
                    .orElse(null);
            expense.setBranch(branch);
        } else {
            expense.setBranch(null);
        }
        return ResponseEntity.ok(expenseRepository.save(expense));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Expense> updateExpense(@PathVariable Long id, @Valid @RequestBody Expense expenseDetails) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found with id: " + id));

        expense.setCategory(expenseDetails.getCategory());
        expense.setAmount(expenseDetails.getAmount());
        expense.setDate(expenseDetails.getDate());
        expense.setDescription(expenseDetails.getDescription());

        if (expenseDetails.getBranch() != null && expenseDetails.getBranch().getId() != null) {
            Branch branch = branchRepository.findById(expenseDetails.getBranch().getId())
                    .orElse(null);
            expense.setBranch(branch);
        } else {
            expense.setBranch(null);
        }

        return ResponseEntity.ok(expenseRepository.save(expense));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExpense(@PathVariable Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found with id: " + id));
        expenseRepository.delete(expense);
        return ResponseEntity.ok().body(Map.of("message", "Expense entry deleted successfully."));
    }
}
