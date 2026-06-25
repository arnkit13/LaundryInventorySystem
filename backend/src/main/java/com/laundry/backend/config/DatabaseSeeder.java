package com.laundry.backend.config;

import com.laundry.backend.entity.Branch;
import com.laundry.backend.entity.User;
import com.laundry.backend.repository.BranchRepository;
import com.laundry.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Seed Users
        if (userRepository.count() == 0) {
            User admin = User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .fullName("Shop Manager (Admin)")
                    .role("ROLE_ADMIN")
                    .active(true)
                    .branch(null)
                    .build();

            User employee = User.builder()
                    .username("employee")
                    .password(passwordEncoder.encode("emp123"))
                    .fullName("Juan Dela Cruz (Employee)")
                    .role("ROLE_USER")
                    .active(true)
                    .branch(null)
                    .build();

            userRepository.saveAll(Arrays.asList(admin, employee));
            System.out.println("Default users seeded: 'admin' / 'admin123' and 'employee' / 'emp123'");
        }
    }
}
