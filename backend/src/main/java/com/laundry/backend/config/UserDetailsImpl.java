package com.laundry.backend.config;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.laundry.backend.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

public class UserDetailsImpl implements UserDetails {
    private static final long serialVersionUID = 1L;

    private final Long id;
    private final String username;
    private final String fullName;
    
    @JsonIgnore
    private final String password;
    
    private final boolean active;
    private final String branchName;
    private final Long branchId;
    private final Collection<? extends GrantedAuthority> authorities;

    public UserDetailsImpl(Long id, String username, String fullName, String password, boolean active,
                           String branchName, Long branchId, Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.username = username;
        this.fullName = fullName;
        this.password = password;
        this.active = active;
        this.branchName = branchName;
        this.branchId = branchId;
        this.authorities = authorities;
    }

    public static UserDetailsImpl build(User user) {
        List<GrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority(user.getRole())
        );

        String bName = user.getBranch() != null ? user.getBranch().getName() : null;
        Long bId = user.getBranch() != null ? user.getBranch().getId() : null;

        return new UserDetailsImpl(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getPassword(),
                user.isActive(),
                bName,
                bId,
                authorities
        );
    }

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getBranchName() {
        return branchName;
    }

    public Long getBranchId() {
        return branchId;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserDetailsImpl user = (UserDetailsImpl) o;
        return Objects.equals(id, user.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
