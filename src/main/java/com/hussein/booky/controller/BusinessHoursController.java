package com.hussein.booky.controller;

import com.hussein.booky.dto.BusinessHoursRequest;
import com.hussein.booky.dto.BusinessHoursResponse;
import com.hussein.booky.entity.BusinessHours;
import com.hussein.booky.service.BusinessHoursService;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/business-hours")
public class BusinessHoursController {

    private final BusinessHoursService businessHoursService;

    public BusinessHoursController(
            BusinessHoursService businessHoursService
    ) {
        this.businessHoursService = businessHoursService;
    }

    @PostMapping("/save")
    public BusinessHoursResponse saveHours(
            @RequestBody BusinessHoursRequest request,
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
                    "Only owners and administrators can update business hours"
            );
        }

        // The service also checks ownership of the selected business.
        BusinessHours savedHours = businessHoursService.saveHours(
                request,
                userId,
                role
        );

        return toResponse(savedHours);
    }

    @GetMapping("/business/{businessId}")
    public List<BusinessHoursResponse> getHours(
            @PathVariable Integer businessId
    ) {
        return businessHoursService.getHours(businessId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private BusinessHoursResponse toResponse(BusinessHours hours) {
        return new BusinessHoursResponse(
                hours.getId(),
                hours.getBusiness() != null
                        ? hours.getBusiness().getId()
                        : null,
                hours.getDayOfWeek(),
                hours.getOpenTime(),
                hours.getCloseTime(),
                hours.isClosed()
        );
    }
}