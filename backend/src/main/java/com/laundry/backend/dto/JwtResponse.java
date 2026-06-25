package com.laundry.backend.dto;

public class JwtResponse {
    private String token;
    private Long id;
    private String username;
    private String fullName;
    private String role;
    private String branchName;
    private Long branchId;

    public JwtResponse() {}

    public JwtResponse(String token, Long id, String username, String fullName, String role, String branchName, Long branchId) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.fullName = fullName;
        this.role = role;
        this.branchName = branchName;
        this.branchId = branchId;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getBranchName() { return branchName; }
    public void setBranchName(String branchName) { this.branchName = branchName; }

    public Long getBranchId() { return branchId; }
    public void setBranchId(Long branchId) { this.branchId = branchId; }
}
