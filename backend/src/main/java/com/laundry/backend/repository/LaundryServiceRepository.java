package com.laundry.backend.repository;

import com.laundry.backend.entity.LaundryService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface LaundryServiceRepository extends JpaRepository<LaundryService, Long> {
    Optional<LaundryService> findByName(String name);
    boolean existsByName(String name);
}
