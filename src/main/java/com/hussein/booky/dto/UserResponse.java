package com.hussein.booky.dto;

import java.time.LocalDateTime;

public class UserResponse {

    private Integer id;
    private String fullName;
    private String email;
    private String phone;
    private String role;

    private boolean frozen;
    private String freezeReason;
    private LocalDateTime frozenAt;

    public UserResponse(
            Integer id,
            String fullName,
            String email,
            String phone,
            String role,
            boolean frozen,
            String freezeReason,
            LocalDateTime frozenAt
    ) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.frozen = frozen;
        this.freezeReason = freezeReason;
        this.frozenAt = frozenAt;
    }

    public Integer getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getPhone() {
        return phone;
    }

    public String getRole() {
        return role;
    }

    public boolean isFrozen() {
        return frozen;
    }

    public String getFreezeReason() {
        return freezeReason;
    }

    public LocalDateTime getFrozenAt() {
        return frozenAt;
    }
}