package com.hussein.booky.controller;

import com.hussein.booky.dto.FreezeUserRequest;
import com.hussein.booky.dto.LoginRequest;
import com.hussein.booky.dto.LoginResponse;
import com.hussein.booky.dto.RegisterRequest;
import com.hussein.booky.dto.UpdateProfileRequest;
import com.hussein.booky.dto.UserResponse;
import com.hussein.booky.security.JwtService;
import com.hussein.booky.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/register")
    public UserResponse register(
            @Valid @RequestBody RegisterRequest request
    ) {
        return userService.register(request);
    }

    @PostMapping("/login")
    public LoginResponse login(
            @Valid @RequestBody LoginRequest request
    ) {
        return userService.login(request);
    }

    @PutMapping("/profile")
    public UserResponse updateProfile(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        String token = authHeader.replace("Bearer ", "");
        Integer userId = jwtService.extractUserId(token);

        return userService.updateProfile(userId, request);
    }

    @GetMapping("/jwt-test")
    public LoginResponse jwtTest() {

        UserResponse user = new UserResponse(
                1,
                "Hussein",
                "test@test.com",
                "70123456",
                "OWNER",
                false,
                null,
                null
        );

        return new LoginResponse("TEST_TOKEN", user);
    }

    @PutMapping("/{userId}/freeze")
    public ResponseEntity<?> freezeUser(
            @PathVariable Integer userId,
            @Valid @RequestBody FreezeUserRequest request,
            HttpServletRequest httpRequest
    ) {
        String role = (String) httpRequest.getAttribute("role");

        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "message",
                            "Only administrators can freeze accounts"
                    ));
        }

        UserResponse user = userService.freezeUser(
                userId,
                request.getReason()
        );

        return ResponseEntity.ok(Map.of(
                "message", "Account frozen successfully",
                "userId", user.getId(),
                "frozen", user.isFrozen(),
                "freezeReason", user.getFreezeReason()
        ));
    }

    @PutMapping("/{userId}/unfreeze")
    public ResponseEntity<?> unfreezeUser(
            @PathVariable Integer userId,
            HttpServletRequest httpRequest
    ) {
        String role = (String) httpRequest.getAttribute("role");

        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "message",
                            "Only administrators can unfreeze accounts"
                    ));
        }

        UserResponse user = userService.unfreezeUser(userId);

        return ResponseEntity.ok(Map.of(
                "message", "Account unfrozen successfully",
                "userId", user.getId(),
                "frozen", user.isFrozen()
        ));
    }
}