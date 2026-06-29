package com.laundry.backend.controller;

import com.laundry.backend.entity.LaundryService;
import com.laundry.backend.repository.LaundryServiceRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
public class LaundryServiceController {

    @Autowired
    private LaundryServiceRepository laundryServiceRepository;

    @Autowired
    private com.laundry.backend.repository.TransactionServiceItemRepository transactionServiceItemRepository;

    @GetMapping
    public ResponseEntity<List<LaundryService>> getAllServices() {
        List<LaundryService> defaultServices = java.util.Arrays.asList(
                new LaundryService(null, "Basic Service", 180.0, "service", null, null),
                new LaundryService(null, "Comforter", 180.0, "pc", null, null),
                new LaundryService(null, "Extra Wash", 20.0, "wash", null, null),
                new LaundryService(null, "Extra Rinse", 20.0, "rinse", null, null),
                new LaundryService(null, "Extra Dry", 30.0, "dry", null, null),
                new LaundryService(null, "Extra Kilo", 20.0, "kilo", null, null),
                new LaundryService(null, "Detergent", 10.0, "sachet", null, null),
                new LaundryService(null, "SELF SERVICE", 100.0, "LOAD", null, null),
                new LaundryService(null, "FREE", 0.0, "LOAD", null, null),
                new LaundryService(null, "BEDSHEETS", 180.0, "", null, null),
                new LaundryService(null, "SOFTENER", 10.0, "", null, null),
                new LaundryService(null, "ICE", 15.0, "PACK", null, null)
        );

        for (LaundryService seed : defaultServices) {
            java.util.Optional<LaundryService> existingOpt = laundryServiceRepository.findByName(seed.getName());
            if (!existingOpt.isPresent()) {
                laundryServiceRepository.save(seed);
            }
        }

        return ResponseEntity.ok(laundryServiceRepository.findAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LaundryService> createService(@Valid @RequestBody LaundryService service) {
        if (service.getId() != null) {
            service.setId(null); // Force creation
        }
        if (laundryServiceRepository.existsByName(service.getName())) {
            throw new RuntimeException("Service with name '" + service.getName() + "' already exists.");
        }
        return ResponseEntity.ok(laundryServiceRepository.save(service));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LaundryService> updateService(@PathVariable Long id, @Valid @RequestBody LaundryService updatedService) {
        LaundryService service = laundryServiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Laundry service not found with id: " + id));

        // Check if name is changing and if it clashes with another service name
        if (!service.getName().equalsIgnoreCase(updatedService.getName()) &&
                laundryServiceRepository.existsByName(updatedService.getName())) {
            throw new RuntimeException("Service with name '" + updatedService.getName() + "' already exists.");
        }

        service.setName(updatedService.getName());
        service.setRate(updatedService.getRate());
        service.setUnit(updatedService.getUnit());

        return ResponseEntity.ok(laundryServiceRepository.save(service));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteService(@PathVariable Long id) {
        LaundryService service = laundryServiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Laundry service not found with id: " + id));

        laundryServiceRepository.delete(service);
        return ResponseEntity.ok().body(java.util.Map.of("message", "Service deleted successfully."));
    }
}
