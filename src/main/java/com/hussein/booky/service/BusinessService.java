package com.hussein.booky.service;

import com.hussein.booky.dto.BusinessRequest;
import com.hussein.booky.dto.BusinessResponse;

import java.util.List;

public interface BusinessService {

    BusinessResponse addBusiness(BusinessRequest request);

    List<BusinessResponse> getAllBusinesses();
}