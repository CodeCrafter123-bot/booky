package com.hussein.booky.controller;

import com.hussein.booky.dto.LoginRequest;
import com.hussein.booky.dto.LoginResponse;
import com.hussein.booky.dto.RegisterRequest;
import com.hussein.booky.dto.UserResponse;
import com.hussein.booky.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public UserResponse register(@Valid @RequestBody RegisterRequest request) {
        return userService.register(request);
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return userService.login(request);
    }
    @GetMapping("/jwt-test")
public LoginResponse jwtTest() {

    UserResponse user = new UserResponse(
            1,
            "Hussein",
            "test@test.com",
            "70123456",
            "OWNER"
    );

    return new LoginResponse("TEST_TOKEN", user);
}
}