package com.hussein.booky.dto;
//a response dto returned after a successfull login it gives the frontend :
/*
A jwt for the future authenticated requests 
safe info about the logged in user  */
public class LoginResponse {

    private String token;
    private UserResponse user;

    public LoginResponse(String token, UserResponse user) {
        this.token = token;
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public UserResponse getUser() {
        return user;
    }
}