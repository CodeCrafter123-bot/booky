package com.hussein.booky.controller;

import com.hussein.booky.dto.BusinessHoursRequest;
import com.hussein.booky.entity.BusinessHours;
import com.hussein.booky.security.JwtService;
import com.hussein.booky.service.BusinessHoursService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;
//this contorller manages the weekly opening and closing hours of each business 
import java.util.List;
//mark it as a rest controller 
@RestController
//every endpoint start with business hours 
@RequestMapping("/business-hours")
@CrossOrigin(origins = "*")
public class BusinessHoursController {
//main logic for saving and retrieving 
    private final BusinessHoursService businessHoursService;

    //used to extract user info from jwt 
    private final JwtService jwtService;
//constructor injection 
    public BusinessHoursController(BusinessHoursService businessHoursService,
                                   JwtService jwtService) {
        this.businessHoursService = businessHoursService;
        this.jwtService = jwtService;
    }

    /*
     * OWNER or ADMIN: Create or update business hours.
     *
     * Endpoint:
     * POST /business-hours/save
     *
     * Required headers:
     * Content-Type: application/json
     * Authorization: Bearer <JWT>
     *
     * Example request body:
     *
     * {
     *   "businessId": 5,
     *   "dayOfWeek": "MONDAY",
     *   "openTime": "09:00",
     *   "closeTime": "17:00",
     *   "closed": false
     * }
     */
    @PostMapping("/save")
    public BusinessHours saveHours(@RequestBody BusinessHoursRequest request,
                                   HttpServletRequest httpRequest) {

        String token = httpRequest.getHeader("Authorization").substring(7);

        Integer userId = jwtService.extractUserId(token).intValue();
        String role = jwtService.extractRole(token);
//passes the following info to the service 
/* requested hours 
logged in user id 
logged in user role 
the service should verify permission before saving 
 */
        return businessHoursService.saveHours(request, userId, role);
    }
//retrieve opening hours for one business 
    @GetMapping("/business/{businessId}")
    //the path variable to read id from the url 
    public List<BusinessHours> getHours(@PathVariable Integer businessId) {
        //retrieve all weekly hours record belonging to the selected business 
        return businessHoursService.getHours(businessId);
    }
}