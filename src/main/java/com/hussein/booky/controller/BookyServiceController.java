package com.hussein.booky.controller;
import com.hussein.booky.security.JwtService;
import com.hussein.booky.dto.BookyServiceRequest;
import com.hussein.booky.dto.BookyServiceResponse;
import com.hussein.booky.service.BookyServiceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
//this class manages the services offered by businesses
import java.util.List;
//every end point in this controller begins with services 
@RestController
@RequestMapping("/services")
public class BookyServiceController {
private final JwtService jwtService;
    private final BookyServiceService bookyServiceService;
//used to read info stored inside the jwt including user id and jwt 
   public BookyServiceController(BookyServiceService bookyServiceService, JwtService jwtService) {
    this.bookyServiceService = bookyServiceService;
    this.jwtService = jwtService;
}
//owner or admin adding service to a business 
    @PostMapping("/add")
    //the endpoint and the auth header 
public ResponseEntity<BookyServiceResponse> addService(
        @Valid @RequestBody BookyServiceRequest request,
        @RequestHeader("Authorization") String authHeader
) {
    String token = authHeader.substring(7);
//remove bearer extract user id and the role form the token
    Integer userId = jwtService.extractUserId(token);
    String role = jwtService.extractRole(token);
//http status and the created service converted  to json 
    return ResponseEntity.ok(bookyServiceService.addService(request, userId, role));
}
//retrieve all services in the application 
    @GetMapping
    public ResponseEntity<List<BookyServiceResponse>> getAllServices() {
        return ResponseEntity.ok(bookyServiceService.getAllServices());
    }
//retreive all services belonging to a specific business 
    @GetMapping("/business/{businessId}")
    public ResponseEntity<List<BookyServiceResponse>> getServicesByBusiness(@PathVariable Integer businessId) {
        return ResponseEntity.ok(bookyServiceService.getServicesByBusiness(businessId));
    }
}