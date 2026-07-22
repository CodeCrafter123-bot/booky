package com.hussein.booky.controller;

import com.hussein.booky.dto.AdminUpdateUserRequest;
import com.hussein.booky.dto.UserResponse;
import com.hussein.booky.security.JwtService;
import com.hussein.booky.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
//user management operations only avaiable by admin 
@RestController

//this class will recieve http reqeust and returned ibject auto convert to json 
@RequestMapping("/admin/users")
//begin of every endpoint in the contorller 
public class AdminUserController {

    @Autowired//perform user management operations 
    private UserService userService;

    @Autowired  // read and validate information from jwts 
    private JwtService jwtService;
    //identifies requester and read their role 


    //getting all users 
    @GetMapping
    public List<UserResponse> getAllUsers(
            @RequestHeader("Authorization") String authHeader//read authorization and stores it in auth header 
    ) {
        validateAdmin(authHeader);//checks admin 
        return userService.getAllUsersForAdmin();//if verifies return list of users 
    }
//getting one user by id 
    @GetMapping("/{id}")//complete endpoint 
    public UserResponse getUserById(

        //validate admin then get user then return response 
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer id
    ) {
        validateAdmin(authHeader);
        return userService.getUserByIdForAdmin(id);
    }
//updating user 
    @PutMapping("/{id}")//end point for this user 
    public UserResponse updateUser(
        //reads id form the url and convert json into adminupdaterequest 
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Integer id,
            @Valid @RequestBody AdminUpdateUserRequest request
            //check annotation in the dto 
    ) {
        validateAdmin(authHeader);
        //returns the updated response 
        return userService.updateUserForAdmin(id, request);
    }

    private void validateAdmin(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String role = jwtService.extractRole(token);

        if (!"ADMIN".equals(role)) {
            throw new RuntimeException("Access denied. Admins only.");
        }

        //removing the bearer since only the token is needed and the extract  the role of the person if not admin access denied 
    }
}