package com.hussein.booky.controller;

import com.hussein.booky.dto.AdminUpdateUserRequest;
import com.hussein.booky.dto.UserResponse;
import com.hussein.booky.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/admin/users")
public class AdminUserController {

    private final UserService userService;

    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<UserResponse> getAllUsers(
            HttpServletRequest httpRequest
    ) {
        validateAdmin(httpRequest);
        return userService.getAllUsersForAdmin();
    }

    @GetMapping("/{id}")
    public UserResponse getUserById(
            @PathVariable Integer id,
            HttpServletRequest httpRequest
    ) {
        validateAdmin(httpRequest);
        return userService.getUserByIdForAdmin(id);
    }

    @PutMapping("/{id}")
    public UserResponse updateUser(
            @PathVariable Integer id,
            @Valid @RequestBody AdminUpdateUserRequest request,
            HttpServletRequest httpRequest
    ) {
        validateAdmin(httpRequest);
        return userService.updateUserForAdmin(id, request);
    }

    private void validateAdmin(HttpServletRequest request) {
        Integer userId = (Integer) request.getAttribute("userId");
        String role = (String) request.getAttribute("role");

        if (userId == null || role == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication is required"
            );
        }

        if (!"ADMIN".equals(role)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Access denied: ADMIN only"
            );
        }
    }
}