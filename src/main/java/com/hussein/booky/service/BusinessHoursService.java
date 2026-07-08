package com.hussein.booky.service;

import com.hussein.booky.dto.BusinessHoursRequest;
import com.hussein.booky.entity.Business;
import com.hussein.booky.entity.BusinessHours;
import com.hussein.booky.repository.BusinessHoursRepository;
import com.hussein.booky.repository.BusinessRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BusinessHoursService {

    private final BusinessHoursRepository businessHoursRepository;
    private final BusinessRepository businessRepository;

    public BusinessHoursService(BusinessHoursRepository businessHoursRepository,
                                BusinessRepository businessRepository) {
        this.businessHoursRepository = businessHoursRepository;
        this.businessRepository = businessRepository;
    }

    public BusinessHours saveHours(BusinessHoursRequest request, Integer userId, String role) {

        Business business = businessRepository.findById(request.getBusinessId())
                .orElseThrow(() -> new RuntimeException("Business not found"));

        if (!role.equals("ADMIN") && !business.getOwner().getId().equals(userId)) {
            throw new RuntimeException("You can only update hours for your own business");
        }

        if (!request.isClosed()) {

            if (request.getOpenTime() == null || request.getCloseTime() == null) {
                throw new RuntimeException("Open time and close time are required");
            }

            if (!request.getOpenTime().isBefore(request.getCloseTime())) {
                throw new RuntimeException("Open time must be before close time");
            }

        }

        BusinessHours hours = businessHoursRepository
                .findByBusinessIdAndDayOfWeek(
                        request.getBusinessId(),
                        request.getDayOfWeek())
                .orElse(new BusinessHours());

        hours.setBusiness(business);
        hours.setDayOfWeek(request.getDayOfWeek());
        hours.setClosed(request.isClosed());

        if (request.isClosed()) {
            hours.setOpenTime(null);
            hours.setCloseTime(null);
        } else {
            hours.setOpenTime(request.getOpenTime());
            hours.setCloseTime(request.getCloseTime());
        }

        return businessHoursRepository.save(hours);
    }

    public List<BusinessHours> getHours(Integer businessId) {
        return businessHoursRepository.findByBusinessId(businessId);
    }
}