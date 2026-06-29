package com.laundry.backend.service;

import com.laundry.backend.dto.TransactionRequest;
import com.laundry.backend.dto.ServiceItemRequest;
import com.laundry.backend.entity.LaundryTransaction;
import com.laundry.backend.entity.SoapProduct;
import com.laundry.backend.entity.User;
import com.laundry.backend.entity.LaundryService;
import com.laundry.backend.repository.TransactionRepository;
import com.laundry.backend.repository.LaundryServiceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TransactionServiceTests {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private LaundryServiceRepository laundryServiceRepository;

    @Mock
    private InventoryService inventoryService;

    @InjectMocks
    private TransactionService transactionService;

    private User employee;
    private SoapProduct soap;
    private TransactionRequest request;

    @BeforeEach
    void setUp() {
        employee = User.builder()
                .id(1L)
                .username("employee")
                .fullName("Juan Dela Cruz")
                .role("ROLE_USER")
                .active(true)
                .build();

        soap = SoapProduct.builder()
                .id(2L)
                .name("Liquid Soap")
                .quantity(10.0)
                .unit("kg")
                .build();

        request = new TransactionRequest(
                LocalDate.now(),
                "Customer Jane",
                8.0,
                2L,
                1.5,
                "Machine 1",
                "Cash",
                null,
                new ArrayList<>()
        );
    }

    @Test
    void createTransaction_success_noServices() {
        // Arrange
        when(inventoryService.getProductById(eq(2L))).thenReturn(soap);
        
        SoapProduct updatedSoap = SoapProduct.builder()
                .id(2L)
                .name("Liquid Soap")
                .quantity(8.5)
                .unit("kg")
                .build();

        when(inventoryService.adjustStock(eq(2L), eq(-1.5), eq("USE_STOCK"), anyString(), eq(employee)))
                .thenReturn(updatedSoap);

        when(transactionRepository.save(any(LaundryTransaction.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        LaundryTransaction result = transactionService.createTransaction(request, employee);

        // Assert
        assertNotNull(result);
        assertEquals(1.5, result.getSoapUsedQty());
        assertEquals(8.5, result.getSoapRemainingQty());
        assertEquals("Customer Jane", result.getCustomerName());
        assertEquals(8.0, result.getWeightKg());
        assertEquals(employee, result.getUser());
        assertEquals("Cash", result.getPaymentMethod());
        assertNull(result.getReferenceNumber());
        assertEquals(0.0, result.getTotalAmount());

        verify(inventoryService).getProductById(eq(2L));
        verify(inventoryService).adjustStock(eq(2L), eq(-1.5), eq("USE_STOCK"), anyString(), eq(employee));
        verify(transactionRepository).save(any(LaundryTransaction.class));
    }

    @Test
    void createTransaction_success_withServices() {
        // Arrange
        LaundryService basicService = new LaundryService(10L, "Basic Service", 180.0, "service", null, null);
        request.setServices(Arrays.asList(new ServiceItemRequest(10L, 2)));
        request.setPaymentMethod("Gcash");
        request.setReferenceNumber("4321");
        
        when(inventoryService.getProductById(eq(2L))).thenReturn(soap);
        
        SoapProduct updatedSoap = SoapProduct.builder()
                .id(2L)
                .name("Liquid Soap")
                .quantity(8.5)
                .unit("kg")
                .build();

        when(inventoryService.adjustStock(eq(2L), eq(-1.5), eq("USE_STOCK"), anyString(), eq(employee)))
                .thenReturn(updatedSoap);

        when(laundryServiceRepository.findById(eq(10L))).thenReturn(Optional.of(basicService));

        when(transactionRepository.save(any(LaundryTransaction.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        LaundryTransaction result = transactionService.createTransaction(request, employee);

        // Assert
        assertNotNull(result);
        assertEquals(360.0, result.getTotalAmount());
        assertEquals("Gcash", result.getPaymentMethod());
        assertEquals("4321", result.getReferenceNumber());
        assertEquals(1, result.getServiceItems().size());
        assertEquals(basicService, result.getServiceItems().get(0).getLaundryService());
        assertEquals(2, result.getServiceItems().get(0).getQuantity());

        verify(inventoryService).getProductById(eq(2L));
        verify(laundryServiceRepository).findById(eq(10L));
        verify(transactionRepository).save(any(LaundryTransaction.class));
    }

    @Test
    void createTransaction_insufficientStock_throwsException() {
        // Arrange
        soap.setQuantity(1.0); // Only 1.0 kg left
        when(inventoryService.getProductById(eq(2L))).thenReturn(soap);

        // Act & Assert
        Exception exception = assertThrows(RuntimeException.class, () -> {
            transactionService.createTransaction(request, employee);
        });

        assertTrue(exception.getMessage().contains("Insufficient stock"));
        verify(inventoryService).getProductById(eq(2L));
        verify(inventoryService, never()).adjustStock(anyLong(), anyDouble(), anyString(), anyString(), any(User.class));
        verify(transactionRepository, never()).save(any(LaundryTransaction.class));
    }
}
