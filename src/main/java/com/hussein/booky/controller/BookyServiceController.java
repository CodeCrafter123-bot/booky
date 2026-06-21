package com.hussein.booky.controller;

import com.hussein.booky.entity.BookyService;
import com.hussein.booky.repository.BookyServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/services")
public class BookyServiceController {

    @Autowired
    private BookyServiceRepository bookyServiceRepository;

    @PostMapping("/add")
    public BookyService addService(@RequestBody BookyService service) {
        return bookyServiceRepository.save(service);
    }

    @GetMapping
    public List<BookyService> getAllServices() {
        return bookyServiceRepository.findAll();
    }

    @GetMapping("/business/{businessId}")
    public List<BookyService> getServicesByBusiness(@PathVariable Integer businessId) {
        return bookyServiceRepository.findByBusinessId(businessId);
    }
}