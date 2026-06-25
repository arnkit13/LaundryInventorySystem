package com.laundry.backend.repository;

import com.laundry.backend.entity.SoapProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface SoapProductRepository extends JpaRepository<SoapProduct, Long> {
    Optional<SoapProduct> findByName(String name);
    boolean existsByName(String name);
}
