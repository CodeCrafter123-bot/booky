package com.hussein.booky.dto;

import jakarta.validation.constraints.NotBlank;

public class BusinessRequest {

    @NotBlank(message = "Business name is required")
    private String name;

    @NotBlank(message = "Business type is required")
    private String type;

    @NotBlank(message = "Location is required")
    private String location;

    @NotBlank(message = "Description is required")
    private String description;

    public String getName() {
        return name;
    }

    public String getType() {
        return type;
    }

    public String getLocation() {
        return location;
    }

    public String getDescription() {
        return description;
    }
}