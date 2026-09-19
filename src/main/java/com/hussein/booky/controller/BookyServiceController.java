package com.hussein.booky.controller;

import com.hussein.booky.dto.BookyServiceRequest;
import com.hussein.booky.dto.BookyServiceResponse;
import com.hussein.booky.service.BookyServiceService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/services")
public class BookyServiceController {

    private final BookyServiceService bookyServiceService;

    public BookyServiceController(
            BookyServiceService bookyServiceService
    ) {
        this.bookyServiceService = bookyServiceService;
    }

    @PostMapping("/add")
    public ResponseEntity<BookyServiceResponse> addService(
            @Valid @RequestBody BookyServiceRequest request,
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
                    "Only owners and administrators can add services"
            );
        }

        // The service checks that an OWNER owns the selected business.
        return ResponseEntity.ok(
                bookyServiceService.addService(request, userId, role)
        );
    }

    @GetMapping
    public ResponseEntity<List<BookyServiceResponse>> getAllServices() {
        return ResponseEntity.ok(
                bookyServiceService.getAllServices()
        );
    }

    @GetMapping("/business/{businessId}")
    public ResponseEntity<List<BookyServiceResponse>> getServicesByBusiness(
            @PathVariable Integer businessId
    ) {
        return ResponseEntity.ok(
                bookyServiceService.getServicesByBusiness(businessId)
        );
    }
}