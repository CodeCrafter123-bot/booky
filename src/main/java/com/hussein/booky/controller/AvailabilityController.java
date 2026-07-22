package com.hussein.booky.controller;

import com.hussein.booky.service.AvailabilityService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
//make it rest controller 
@RestController
//every end point start with availability 
@RequestMapping("/availability")

public class AvailabilityController {
//allowing frontend to request available appointment times 
    private final AvailabilityService availabilityService;

    public AvailabilityController(AvailabilityService availabilityService) {
        this.availabilityService = availabilityService;
    }

    @GetMapping("/slots")
    //read service id form url and convert it to integer then read date from url convert it to local date  
    public List<String> getAvailableSlots(@RequestParam Integer serviceId,
                                          @RequestParam LocalDate date) {
        return availabilityService.getAvailableSlots(serviceId, date);
        //call the service layer and calculate available times 
        //spring automitaclly will convert the java list into a json array 
    }
}