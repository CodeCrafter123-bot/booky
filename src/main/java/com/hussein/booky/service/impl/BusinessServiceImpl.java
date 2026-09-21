package com.hussein.booky.service.impl;

import com.hussein.booky.dto.BusinessRequest;
import com.hussein.booky.dto.BusinessResponse;
import com.hussein.booky.entity.Business;
import com.hussein.booky.entity.User;
import com.hussein.booky.repository.BusinessRepository;
import com.hussein.booky.repository.UserRepository;
import com.hussein.booky.service.BusinessService;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class BusinessServiceImpl implements BusinessService {

    private final BusinessRepository businessRepository;
    private final UserRepository userRepository;

    public BusinessServiceImpl(
            BusinessRepository businessRepository,
            UserRepository userRepository
    ) {
        this.businessRepository = businessRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public BusinessResponse addBusiness(
            BusinessRequest request,
            Integer ownerId
    ) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Owner not found"
                ));

        Business business = new Business();
        business.setName(request.getName());
        business.setType(request.getType());
        business.setLocation(request.getLocation());
        business.setDescription(request.getDescription());
        business.setOwner(owner);

        Business savedBusiness = businessRepository.save(business);

        return mapToResponse(savedBusiness);
    }

    @Override
    public List<BusinessResponse> getAllBusinesses() {
        return businessRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public BusinessResponse getBusinessById(Integer businessId) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Business not found with ID: " + businessId
                ));

        return mapToResponse(business);
    }

    @Override
    public List<BusinessResponse> getBusinessesByOwner(Integer ownerId) {
        if (ownerId == null) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Authentication is required"
            );
        }

        return businessRepository.findByOwnerId(ownerId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private BusinessResponse mapToResponse(Business business) {
        return new BusinessResponse(
                business.getId(),
                business.getName(),
                business.getType(),
                business.getLocation(),
                business.getDescription(),
                business.getOwner() != null
                        ? business.getOwner().getId()
                        : null
        );
    }
}