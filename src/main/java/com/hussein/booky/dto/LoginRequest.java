package com.hussein.booky.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
//request dto contains the info a user sends when logging in 
public class LoginRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Email format is invalid")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }
}