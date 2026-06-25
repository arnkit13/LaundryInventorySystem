package com.laundry.backend.service;

import com.laundry.backend.dto.TransactionRequest;
import com.laundry.backend.entity.LaundryTransaction;
import com.laundry.backend.entity.SoapProduct;
import com.laundry.backend.entity.User;
import com.laundry.backend.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private InventoryService inventoryService;

    public List<LaundryTransaction> getTransactions(User user) {
        if ("ROLE_ADMIN".equals(user.getRole())) {
            return transactionRepository.findAllByOrderByIdDesc();
        } else {
            return transactionRepository.findByUserOrderByDateDescIdDesc(user);
        }
    }

    @Transactional
    public LaundryTransaction createTransaction(TransactionRequest request, User performer) {
        // Retrieve and validate soap product stock
        SoapProduct product = inventoryService.getProductById(request.getSoapProductId());
        
        if (product.getQuantity() < request.getSoapUsedQty()) {
            throw new RuntimeException("Error: Insufficient stock for " + product.getName() 
                    + ". Available: " + product.getQuantity() + " " + product.getUnit() 
                    + ", Requested: " + request.getSoapUsedQty() + " " + product.getUnit());
        }

        // Deduct soap stock and record inventory history
        String historyNotes = "Used for customer transaction (Weight: " + request.getWeightKg() + " kg" 
                + (request.getCustomerName() != null && !request.getCustomerName().isBlank() ? ", Customer: " + request.getCustomerName() : "") + ")";
        
        SoapProduct updatedProduct = inventoryService.adjustStock(
                product.getId(), 
                -request.getSoapUsedQty(), 
                "USE_STOCK", 
                historyNotes, 
                performer
        );

        // Build and save laundry transaction
        LaundryTransaction transaction = LaundryTransaction.builder()
                .date(request.getDate())
                .customerName(request.getCustomerName())
                .weightKg(request.getWeightKg())
                .soapProduct(updatedProduct)
                .soapUsedQty(request.getSoapUsedQty())
                .soapRemainingQty(updatedProduct.getQuantity())
                .user(performer)
                .machineNumber(request.getMachineNumber())
                .branch(performer.getBranch())
                .build();

        return transactionRepository.save(transaction);
    }
}
