package com.laundry.backend.service;

import com.laundry.backend.dto.UserRequest;
import com.laundry.backend.entity.User;
import com.laundry.backend.entity.Branch;
import com.laundry.backend.repository.UserRepository;
import com.laundry.backend.repository.BranchRepository;
import com.laundry.backend.repository.TransactionRepository;
import com.laundry.backend.repository.SoapInventoryHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private SoapInventoryHistoryRepository soapInventoryHistoryRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    @Transactional
    public User createUser(UserRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Error: Username is already taken!");
        }

        if (!StringUtils.hasText(request.getPassword())) {
            throw new RuntimeException("Error: Password is required for new user!");
        }

        Branch branch = null;
        if (request.getBranchId() != null) {
            branch = branchRepository.findById(request.getBranchId())
                    .orElseThrow(() -> new RuntimeException("Error: Branch not found with id: " + request.getBranchId()));
        }

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(request.getRole())
                .active(request.isActive())
                .branch(branch)
                .build();

        return userRepository.save(user);
    }

    @Transactional
    public User updateUser(Long id, UserRequest request) {
        User user = getUserById(id);

        // Check if username changes and is already taken
        if (!user.getUsername().equals(request.getUsername()) && userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Error: Username is already taken!");
        }

        Branch branch = null;
        if (request.getBranchId() != null) {
            branch = branchRepository.findById(request.getBranchId())
                    .orElseThrow(() -> new RuntimeException("Error: Branch not found with id: " + request.getBranchId()));
        }

        user.setUsername(request.getUsername());
        user.setFullName(request.getFullName());
        user.setRole(request.getRole());
        user.setActive(request.isActive());
        user.setBranch(branch);

        // Update password if provided
        if (StringUtils.hasText(request.getPassword())) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return userRepository.save(user);
    }

    @Transactional
    public User toggleUserActive(Long id) {
        User user = getUserById(id);
        user.setActive(!user.isActive());
        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = getUserById(id);

        boolean hasTransactions = transactionRepository.existsByUser(user);
        boolean hasInventoryHistory = soapInventoryHistoryRepository.existsByPerformedBy(user);

        if (hasTransactions || hasInventoryHistory) {
            user.setActive(false);
            userRepository.save(user);
            throw new RuntimeException("DEACTIVATED: Cannot delete employee because they have recorded laundry washes or inventory logs. Their account has been deactivated instead to preserve historical records.");
        }

        userRepository.delete(user);
    }
}
