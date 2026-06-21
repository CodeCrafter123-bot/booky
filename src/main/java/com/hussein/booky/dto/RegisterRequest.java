package com.hussein.booky.dto;

public class RegisterRequest {

    private String fullName;
    private String email;
    private String password;
    private String phone;
    private String role;

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public String getPhone() {
        return phone;
    }

    public String getRole() {
        return role;
    }
}