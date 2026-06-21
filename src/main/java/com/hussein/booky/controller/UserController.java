package com.hussein.booky.controller;

import com.hussein.booky.dto.LoginRequest;
import com.hussein.booky.dto.RegisterRequest;
import com.hussein.booky.dto.UserResponse;
import com.hussein.booky.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public UserResponse register(@RequestBody RegisterRequest request) {
        return userService.register(request);
    }

    @PostMapping("/login")
    public UserResponse login(@RequestBody LoginRequest request) {
        return userService.login(request);
    }
}