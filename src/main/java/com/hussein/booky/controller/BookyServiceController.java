package com.hussein.booky.controller;

import com.hussein.booky.dto.BookyServiceRequest;
import com.hussein.booky.dto.BookyServiceResponse;
import com.hussein.booky.service.BookyServiceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/services")
public class BookyServiceController {

    private final BookyServiceService bookyServiceService;

    public BookyServiceController(BookyServiceService bookyServiceService) {
        this.bookyServiceService = bookyServiceService;
    }

    @PostMapping("/add")
    public ResponseEntity<BookyServiceResponse> addService(@Valid @RequestBody BookyServiceRequest request) {
        return ResponseEntity.ok(bookyServiceService.addService(request));
    }

    @GetMapping
    public ResponseEntity<List<BookyServiceResponse>> getAllServices() {
        return ResponseEntity.ok(bookyServiceService.getAllServices());
    }

    @GetMapping("/business/{businessId}")
    public ResponseEntity<List<BookyServiceResponse>> getServicesByBusiness(@PathVariable Integer businessId) {
        return ResponseEntity.ok(bookyServiceService.getServicesByBusiness(businessId));
    }
}