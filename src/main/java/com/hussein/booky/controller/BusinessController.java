package com.hussein.booky.controller;

import com.hussein.booky.entity.Business;
import com.hussein.booky.repository.BusinessRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/businesses")
public class BusinessController {

    @Autowired
    private BusinessRepository businessRepository;

    @PostMapping("/add")
    public Business addBusiness(@RequestBody Business business) {
        return businessRepository.save(business);
    }

    @GetMapping
    public List<Business> getAllBusinesses() {
        return businessRepository.findAll();
    }
}