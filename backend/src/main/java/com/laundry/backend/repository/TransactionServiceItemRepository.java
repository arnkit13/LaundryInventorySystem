package com.laundry.backend.repository;

import com.laundry.backend.entity.TransactionServiceItem;
import com.laundry.backend.entity.LaundryTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TransactionServiceItemRepository extends JpaRepository<TransactionServiceItem, Long> {
    List<TransactionServiceItem> findByTransaction(LaundryTransaction transaction);
    boolean existsByLaundryServiceId(Long serviceId);
}
