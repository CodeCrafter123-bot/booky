package com.hussein.booky.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
   
//all dto files transfers and validates data betweeen the frontend and controller 

public class AdminUpdateUserRequest {
//not blank means the field is required and cannot be empty
    @NotBlank(message = "Full name is required")
    private String fullName;
    

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Phone is required")
    private String phone;

    @NotBlank(message = "Role is required")
    private String role;

    public AdminUpdateUserRequest() {
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

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public void setRole(String role) {
        this.role = role;
    }
}