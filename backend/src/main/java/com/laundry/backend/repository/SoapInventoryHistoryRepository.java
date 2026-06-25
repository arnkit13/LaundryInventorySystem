package com.laundry.backend.repository;

import com.laundry.backend.entity.SoapInventoryHistory;
import com.laundry.backend.entity.User;
import com.laundry.backend.entity.SoapProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SoapInventoryHistoryRepository extends JpaRepository<SoapInventoryHistory, Long> {
    List<SoapInventoryHistory> findAllByOrderByCreatedAtDesc();
    boolean existsByPerformedBy(User user);
    List<SoapInventoryHistory> findBySoapProduct(SoapProduct soapProduct);
}
