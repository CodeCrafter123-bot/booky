package com.hussein.booky.service.impl;

import com.hussein.booky.dto.BookyServiceRequest;
import com.hussein.booky.dto.BookyServiceResponse;
import com.hussein.booky.entity.BookyService;
import com.hussein.booky.entity.Business;
import com.hussein.booky.repository.BookyServiceRepository;
import com.hussein.booky.repository.BusinessRepository;
import com.hussein.booky.service.BookyServiceService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookyServiceServiceImpl implements BookyServiceService {

    private final BookyServiceRepository bookyServiceRepository;
    private final BusinessRepository businessRepository;

    public BookyServiceServiceImpl(BookyServiceRepository bookyServiceRepository,
                                   BusinessRepository businessRepository) {
        this.bookyServiceRepository = bookyServiceRepository;
        this.businessRepository = businessRepository;
    }

   @Override
public BookyServiceResponse addService(BookyServiceRequest request, Integer userId, String role) {

    Business business = businessRepository.findById(request.getBusinessId())
            .orElseThrow(() -> new RuntimeException("Business not found"));

    if (role.equals("OWNER")) {
        if (business.getOwner() == null || !business.getOwner().getId().equals(userId)) {
            throw new RuntimeException("You are not allowed to add services to this business");
        }
    }

    BookyService service = new BookyService();
    service.setName(request.getName());
    service.setDescription(request.getDescription());
    service.setDurationMinutes(request.getDurationMinutes());
    service.setPrice(request.getPrice());
    service.setActive(request.getActive() == null ? true : request.getActive());
    service.setBusiness(business);

    BookyService savedService = bookyServiceRepository.save(service);

    return mapToResponse(savedService);
}
    @Override
    public List<BookyServiceResponse> getAllServices() {
        return bookyServiceRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<BookyServiceResponse> getServicesByBusiness(Integer businessId) {
        return bookyServiceRepository.findByBusinessId(businessId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private BookyServiceResponse mapToResponse(BookyService service) {
        Business business = service.getBusiness();

        return new BookyServiceResponse(
                service.getId(),
                service.getName(),
                service.getDescription(),
                service.getDurationMinutes(),
                service.getPrice(),
                service.getActive(),
                business != null ? business.getId() : null,
                business != null ? business.getName() : null
        );
    }
}