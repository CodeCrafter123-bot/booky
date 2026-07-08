package com.hussein.booky.controller;

import com.hussein.booky.service.AvailabilityService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/availability")
@CrossOrigin(origins = "*")
public class AvailabilityController {

    private final AvailabilityService availabilityService;

    public AvailabilityController(AvailabilityService availabilityService) {
        this.availabilityService = availabilityService;
    }

    @GetMapping("/slots")
    public List<String> getAvailableSlots(@RequestParam Integer serviceId,
                                          @RequestParam LocalDate date) {
        return availabilityService.getAvailableSlots(serviceId, date);
    }
}