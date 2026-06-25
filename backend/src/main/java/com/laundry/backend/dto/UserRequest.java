package com.laundry.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class UserRequest {
    @NotBlank(message = "Username is required")
    private String username;

    private String password; // Optional on update

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Role is required")
    private String role; // 'ROLE_ADMIN' or 'ROLE_USER'

    private boolean active = true;

    private Long branchId; // ID of the branch the user works at

    public UserRequest() {}

    public UserRequest(String username, String password, String fullName, String role, boolean active, Long branchId) {
        this.username = username;
        this.password = password;
        this.fullName = fullName;
        this.role = role;
        this.active = active;
        this.branchId = branchId;
    }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
}
