package com.laundry.backend.repository;

import com.laundry.backend.entity.Expense;
import com.laundry.backend.entity.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByBranch(Branch branch);
}
