package com.hussein.booky.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
/*
request dto contains the profile info a logged in user wants to change 
it currently allows user to update full name and to change emil address  */
public class UpdateProfileRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    @NotBlank(message = "Phone number is required")
    private String phone;

    public UpdateProfileRequest() {
    }

    public UpdateProfileRequest(String fullName, String email, String phone) {
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
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

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}