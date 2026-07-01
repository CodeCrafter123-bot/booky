package com.hussein.booky.controller;

import com.hussein.booky.dto.BusinessRequest;
import com.hussein.booky.dto.BusinessResponse;
import com.hussein.booky.security.JwtService;
import com.hussein.booky.service.BusinessService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/businesses")
public class BusinessController {

    private final BusinessService businessService;
    private final JwtService jwtService;

    public BusinessController(BusinessService businessService, JwtService jwtService) {
        this.businessService = businessService;
        this.jwtService = jwtService;
    }

    @PostMapping("/add")
    public ResponseEntity<BusinessResponse> addBusiness(
            @Valid @RequestBody BusinessRequest request,
            @RequestHeader("Authorization") String authHeader
    ) {
        String token = authHeader.substring(7);
        Integer ownerId = jwtService.extractUserId(token);

        return ResponseEntity.ok(businessService.addBusiness(request, ownerId));
    }

    @GetMapping
    public ResponseEntity<List<BusinessResponse>> getAllBusinesses() {
        return ResponseEntity.ok(businessService.getAllBusinesses());
    }
}