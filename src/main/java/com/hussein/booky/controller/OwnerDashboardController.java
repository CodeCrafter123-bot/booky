package com.hussein.booky.controller;

import com.hussein.booky.dto.OwnerDashboardResponse;
import com.hussein.booky.service.OwnerDashboardService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/owner/dashboard")
public class OwnerDashboardController {

    private final OwnerDashboardService ownerDashboardService;

    public OwnerDashboardController(
            OwnerDashboardService ownerDashboardService
    ) {
        this.ownerDashboardService = ownerDashboardService;
    }

    @GetMapping
    public ResponseEntity<OwnerDashboardResponse> getDashboard(
            HttpServletRequest request
    ) {
        Integer ownerId =
                (Integer) request.getAttribute("userId");

        return ResponseEntity.ok(
                ownerDashboardService.getDashboard(ownerId)
        );
    }
}