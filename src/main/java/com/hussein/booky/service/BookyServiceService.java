package com.hussein.booky.service;

import com.hussein.booky.dto.BookyServiceRequest;
import com.hussein.booky.dto.BookyServiceResponse;

import java.util.List;

public interface BookyServiceService {

   BookyServiceResponse addService(BookyServiceRequest request, Integer userId, String role);

    List<BookyServiceResponse> getAllServices();

    List<BookyServiceResponse> getServicesByBusiness(Integer businessId);
}