package com.hussein.booky.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class BookyServiceRequest {

    @NotBlank(message = "Service name is required")
    private String name;

    private String description;

    @NotNull(message = "Duration is required")
    @Positive(message = "Duration must be positive")
    private Integer durationMinutes;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private Double price;

    private Boolean active = true;

    @NotNull(message = "Business ID is required")
    private Integer businessId;

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public Double getPrice() {
        return price;
    }

    public Boolean getActive() {
        return active;
    }

    public Integer getBusinessId() {
        return businessId;
    }
}