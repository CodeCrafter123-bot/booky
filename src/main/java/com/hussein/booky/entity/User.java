package com.hussein.booky.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String fullName;

    @Column(unique = true)
    private String email;
    @Column(nullable = false)
private boolean frozen = false;

@Column(length = 500)
private String freezeReason;

private LocalDateTime frozenAt;

    private String password;

    private String phone;

    private String role;

    public User() {
    }

    public User(String fullName, String email, String password,
                String phone, String role) {
        this.fullName = fullName;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.role = role;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }
    public boolean isFrozen() {
    return frozen;
}

public void setFrozen(boolean frozen) {
    this.frozen = frozen;
}

public String getFreezeReason() {
    return freezeReason;
}

public void setFreezeReason(String freezeReason) {
    this.freezeReason = freezeReason;
}

public LocalDateTime getFrozenAt() {
    return frozenAt;
}

public void setFrozenAt(LocalDateTime frozenAt) {
    this.frozenAt = frozenAt;
}

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}