package com.hussein.booky.controller;

import com.hussein.booky.dto.BusinessRequest;
import com.hussein.booky.dto.BusinessResponse;
import com.hussein.booky.security.JwtService;
import com.hussein.booky.service.BusinessService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
//this is for managing booky businesses such as barbers ,clinics,and gyms 
import java.util.List;
//rest contorller class 
@RestController
//every endpoints start with businesses 
@RequestMapping("/businesses")
public class BusinessController {
        //this contains business related logic 
        /*creating businesses 
        retrieving all businesses 
        retrieving one businesses 
        
        */

    private final BusinessService businessService;
//used to read info stored inside the jwt 
    private final JwtService jwtService;
//constructor 
    public BusinessController(
            BusinessService businessService,
            JwtService jwtService
    ) {
        this.businessService = businessService;
        this.jwtService = jwtService;
    }
 /*
     * OWNER or ADMIN: Create a new business.
     *
     * Endpoint:
     * POST /businesses/add
     *
     * Required headers:
     * Content-Type: application/json
     * Authorization: Bearer <JWT>
     *
     * Example request body:
     *
     * {
     *   "name": "Booky Barber",
     *   "type": "Barber",
     *   "location": "Beirut",
     *   "description": "Modern barber booking service"
     * }
     */
    @PostMapping("/add")
    public ResponseEntity<BusinessResponse> addBusiness(
            @Valid @RequestBody BusinessRequest request,
            @RequestHeader("Authorization") String authHeader
    ) {
        String token = authHeader.substring(7);
        Integer ownerId = jwtService.extractUserId(token);

        return ResponseEntity.ok(
                businessService.addBusiness(request, ownerId)
        );
    }
//retrieve every business available in booky 
    @GetMapping
    public ResponseEntity<List<BusinessResponse>> getAllBusinesses() {
        //calls the service to retrieve businesses 
        //a list is returned because booky can contain multiple businesses 
        return ResponseEntity.ok(
                businessService.getAllBusinesses()
        );
    }
//retreiving business by its id 
    @GetMapping("/{id}")
    public ResponseEntity<BusinessResponse> getBusinessById(
            @PathVariable Integer id
    ) {
        /*
        service should :
        search for business 
        handle case whereit does not exist 
        convert it to business response 
        */
        return ResponseEntity.ok(
                businessService.getBusinessById(id)
        );
    }
}