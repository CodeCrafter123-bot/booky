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
//this controller for managinf user eelated operations 

//rest controller telling spring boot that the class recieves a http request and returns data usually json 
@RestController
//every endpoint start with  users 
@RequestMapping("/users")
public class UserController {
//user related logic 
/*
register /login /profile updates /freezing and unfreezing 
*/
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
 /*
     * Register a new user.
     *
     * Endpoint:
     * POST /users/register
     *
     * Example request:
     *
     * {
     *   "fullName": "Hussein Zeidan",
     *   "email": "hussein@example.com",
     *   "password": "StrongPassword123",
     *   "phone": "70123456",
     *   "role": "CLIENT"
     * }
     */
    @PostMapping("/login")
    public LoginResponse login(
            @Valid @RequestBody LoginRequest request
    ) {
        return userService.login(request);
    }
//authenticate a user 
    @PutMapping("/profile")
    public UserResponse updateProfile(

        //convert to json and validate its fields 
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        String token = authHeader.replace("Bearer ", "");
        Integer userId = jwtService.extractUserId(token);
/*service should 
find user by email 
check frozen acc 
check pass and compare with bcrypt
generate a jwt 
retunr the jwt and safe user info  */
        return userService.updateProfile(userId, request);
    }
/*temporary testing endpoint 

does not access mysql and dont create a real jwt 
return hard coded test data
*/
    @GetMapping("/jwt-test")
    public LoginResponse jwtTest() {
//temp user respone manually 
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
//admin  freeze a user account 
    @PutMapping("/{userId}/freeze")
    public ResponseEntity<?> freezeUser(
//reads the target user from the url 
        @PathVariable Integer userId,
            @Valid @RequestBody FreezeUserRequest request,
            HttpServletRequest httpRequest
    ) {
        String role = (String) httpRequest.getAttribute("role");
//only admins allowed to freeze account 
        if (!"ADMIN".equals(role)) {
                //returns http status 403 forbidden and json error message 
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "message",
                            "Only administrators can freeze accounts"
                    ));
        }
//calls the service to freeze the selected user 
        UserResponse user = userService.freezeUser(
                userId,
                request.getReason()
        );
//Map.of() creates key-value pairs that Spring converts to JSON.
        return ResponseEntity.ok(Map.of(
                "message", "Account frozen successfully",
                "userId", user.getId(),
                "frozen", user.isFrozen(),
                "freezeReason", user.getFreezeReason()
        ));
    }
//admin unfreeze a user account 
    @PutMapping("/{userId}/unfreeze")
    public ResponseEntity<?> unfreezeUser(
            @PathVariable Integer userId,
            HttpServletRequest httpRequest
    ) {
        //read authenticated user role 
        String role = (String) httpRequest.getAttribute("role");
//reject if not admin
        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of(
                            "message",
                            "Only administrators can unfreeze accounts"
                    ));
        }
//calls the service to unfreeze 
        UserResponse user = userService.unfreezeUser(userId);

        return ResponseEntity.ok(Map.of(
                "message", "Account unfrozen successfully",
                "userId", user.getId(),
                "frozen", user.isFrozen()
        ));
    }
}