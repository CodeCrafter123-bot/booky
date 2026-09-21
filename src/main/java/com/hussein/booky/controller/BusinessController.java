package com.hussein.booky.controller;

import com.hussein.booky.dto.BusinessRequest;
import com.hussein.booky.dto.BusinessResponse;
import com.hussein.booky.service.BusinessService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/businesses")
public class BusinessController {

    private final BusinessService businessService;

    public BusinessController(BusinessService businessService) {
        this.businessService = businessService;
    }

    @PostMapping("/add")
    public ResponseEntity<BusinessResponse> addBusiness(
            @Valid @RequestBody BusinessRequest request,
            HttpServletRequest httpRequest
    ) {
        Integer ownerId = requireOwnerOrAdmin(httpRequest);

        return ResponseEntity.ok(
                businessService.addBusiness(request, ownerId)
        );
    }

    @GetMapping
    public ResponseEntity<List<BusinessResponse>> getAllBusinesses() {
        return ResponseEntity.ok(
                businessService.getAllBusinesses()
        );
    }

    @GetMapping("/mine")
    public ResponseEntity<List<BusinessResponse>> getMyBusinesses(
            HttpServletRequest httpRequest
    ) {
        Integer ownerId = requireOwnerOrAdmin(httpRequest);

        return ResponseEntity.ok(
                businessService.getBusinessesByOwner(ownerId)
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<BusinessResponse> getBusinessById(
            @PathVariable Integer id
    ) {
        return ResponseEntity.ok(
                businessService.getBusinessById(id)
        );
    }

    private Integer requireOwnerOrAdmin(
            HttpServletRequest httpRequest
    ) {
        Integer userId =
                (Integer) httpRequest.getAttribute("userId");

        String role =
                (String) httpRequest.getAttribute("role");

        if (userId == null || role == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication is required"
            );
        }

        if (!"OWNER".equals(role) && !"ADMIN".equals(role)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only owners and administrators can access this operation"
            );
        }

        return userId;
    }
}