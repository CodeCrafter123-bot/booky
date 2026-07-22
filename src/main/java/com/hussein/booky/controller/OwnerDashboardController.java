package com.hussein.booky.controller;

import com.hussein.booky.dto.OwnerDashboardResponse;
import com.hussein.booky.service.OwnerDashboardService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
//this class returns all info needed for the owner dashboard 
@RestController
@RequestMapping("/owner/dashboard")
public class OwnerDashboardController {
//service that build dash info 
    private final OwnerDashboardService ownerDashboardService;

    public OwnerDashboardController(
            OwnerDashboardService ownerDashboardService
    ) {
        //stores the injected service in the controller field 
        this.ownerDashboardService = ownerDashboardService;
    }
//owner retrieve the logged in owner dashboard info 
//endpoint with required header 
//no additional path beacuse get mapping has no value it uses contorller path directly 
    @GetMapping
    public ResponseEntity<OwnerDashboardResponse> getDashboard(
            HttpServletRequest request//read then user id form the http request 
    ) {
        Integer ownerId =
                (Integer) request.getAttribute("userId");

        return ResponseEntity.ok(
                ownerDashboardService.getDashboard(ownerId)
        );
    }
}