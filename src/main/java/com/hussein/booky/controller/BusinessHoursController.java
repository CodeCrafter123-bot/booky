package com.hussein.booky.controller;

import com.hussein.booky.dto.BusinessHoursRequest;
import com.hussein.booky.entity.BusinessHours;
import com.hussein.booky.security.JwtService;
import com.hussein.booky.service.BusinessHoursService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/business-hours")
@CrossOrigin(origins = "*")
public class BusinessHoursController {

    private final BusinessHoursService businessHoursService;
    private final JwtService jwtService;

    public BusinessHoursController(BusinessHoursService businessHoursService,
                                   JwtService jwtService) {
        this.businessHoursService = businessHoursService;
        this.jwtService = jwtService;
    }

    @PostMapping("/save")
    public BusinessHours saveHours(@RequestBody BusinessHoursRequest request,
                                   HttpServletRequest httpRequest) {

        String token = httpRequest.getHeader("Authorization").substring(7);

        Integer userId = jwtService.extractUserId(token).intValue();
        String role = jwtService.extractRole(token);

        return businessHoursService.saveHours(request, userId, role);
    }

    @GetMapping("/business/{businessId}")
    public List<BusinessHours> getHours(@PathVariable Integer businessId) {
        return businessHoursService.getHours(businessId);
    }
}