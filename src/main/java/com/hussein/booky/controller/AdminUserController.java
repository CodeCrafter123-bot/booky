package com.hussein.booky.controller;

import com.hussein.booky.dto.AdminUpdateUserRequest;
import com.hussein.booky.dto.UserResponse;
import com.hussein.booky.security.JwtService;
import com.hussein.booky.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/users")
public class AdminUserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    @GetMapping
    public List<UserResponse> getAllUsers(
            @RequestHeader("Authorization") String authHeader
    ) {
        validateAdmin(authHeader);
        return userService.getAllUsersForAdmin();
    }

    @GetMapping("/{id}")
    public UserResponse getUserById(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer id
    ) {
        validateAdmin(authHeader);
        return userService.getUserByIdForAdmin(id);
    }

    @PutMapping("/{id}")
    public UserResponse updateUser(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer id,
            @Valid @RequestBody AdminUpdateUserRequest request
    ) {
        validateAdmin(authHeader);
        return userService.updateUserForAdmin(id, request);
    }

    private void validateAdmin(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String role = jwtService.extractRole(token);

        if (!"ADMIN".equals(role)) {
            throw new RuntimeException("Access denied. Admins only.");
        }
    }
}